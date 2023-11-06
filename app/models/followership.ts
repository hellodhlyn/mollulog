import { SupabaseClient } from "@supabase/supabase-js";
import { Env, getDB } from "~/env.server";
import { SupabaseSchema } from "~/schema";
import { Sensei, UserRepo } from "./sensei";

export type Followership = SupabaseSchema["public"]["Tables"]["dev_followerships"]["Row"];
export type Relationship = {
  followed: boolean;
  following: boolean;
};

export async function follow(env: Env, followerId: number, followeeId: number) {
  const repo = new FollowershipRepo(env);
  await repo.create(followerId, followeeId);
}

export async function unfollow(env: Env, followerId: number, followeeId: number) {
  const repo = new FollowershipRepo(env);
  await repo.deleteByFollowerIdAndFolloweeId(followerId, followeeId);
}

export async function getRelationship(env: Env, fromId: number, oppositeId: number): Promise<Relationship> {
  const repo = new FollowershipRepo(env);
  const followingsId = (await repo.findAllBy("followerId", fromId)).map((each) => each.followeeId);
  const followersId = (await repo.findAllBy("followeeId", fromId)).map((each) => each.followerId);
  return {
    following: followingsId.includes(oppositeId),
    followed: followersId.includes(oppositeId),
  };
}

export async function getFollowers(env: Env, followeeId: number): Promise<Sensei[]> {
  const followershipRepo = new FollowershipRepo(env); 
  const followerIds = (await followershipRepo.findAllBy("followeeId", followeeId)).map((each) => each.followerId);
  if (followerIds.length === 0) {
    return [];
  }

  const userRepo = new UserRepo(env);
  return userRepo.findAllByIn("id", followerIds);
}

export async function getFollowing(env: Env, followerId: number): Promise<Sensei[]> {
  const followershipRepo = new FollowershipRepo(env);
  const followeeIds = (await followershipRepo.findAllBy("followerId", followerId)).map((each) => each.followeeId);
  if (followeeIds.length === 0) {
    return [];
  }

  const userRepo = new UserRepo(env);
  return userRepo.findAllByIn("id", followeeIds);
}

class FollowershipRepo {
  private db: SupabaseClient<SupabaseSchema>;
  private tableName: string;

  constructor(env: Env) {
    this.db = getDB(env);
    this.tableName = `${env.STAGE}_followerships`;
  }

  async create(followerId: number, followeeId: number) {
    const { error } = await this.table().insert({ followerId, followeeId });
    if (error) {
      throw error;
    }
  }

  async findAllBy(field: string, value: any): Promise<Followership[]> {
    const { data, error } = await this.table().select("*").eq(field, value);
    if (error || !data) {
      console.error(error);
      return [];
    }
    return data;
  }

  async deleteByFollowerIdAndFolloweeId(followerId: number, followeeId: number) {
    const { error } = await this.table().delete()
      .eq("followerId", followerId)
      .eq("followeeId", followeeId);
    if (error) {
      throw error;
    }
  }

  private table() {
    return this.db.from(this.tableName);
  }
}
