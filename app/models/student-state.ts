import type { Env } from "~/env.server";
import type { Sensei } from "./sensei";
import { getSenseiByUsername } from "./sensei";
import type { AllStudentsQuery } from "~/graphql/graphql";
import { runQuery } from "~/lib/baql";
import type { AttackType, DefenseType } from "./content";
import { graphql } from "~/graphql";
import { fetchCached } from "./base";

export type Role = "striker" | "special";
export type Student = {
  id: string;
  name: string;
  school: string;
  initialTier: number;
  order: number;
  attackType: AttackType;
  defenseType: DefenseType;
  role: Role;
  equipments: string[];
  released: boolean;
};

export type StudentMap = { [id: string]: Student };

export type StudentState = {
  student: Student;
  owned: boolean;
  tier?: number | null;
};

const allStudentsQuery = graphql(`
  query AllStudents {
    students {
      id: studentId
      name
      school
      initialTier
      order
      attackType
      defenseType
      role
      equipments
      released
    }
  }
`);

async function getStudentsMap(env: Env, includeUnreleased: boolean = false): Promise<StudentMap> {
  return fetchCached(env, `students::includeUnreleased=${includeUnreleased}`, async () => {
    const { data } = await runQuery<AllStudentsQuery>(allStudentsQuery, {});
    const students = (data?.students ?? []).filter(({ released }) => includeUnreleased || released);
    const result: StudentMap = {};
    for (const student of students) {
      result[student.id] = student;
    }
    return result;
  }, 10 * 60);
}

export function userStateKeyById(id: number) {
  return `student-states:id:${id}`;
}

export async function getUserStudentStates(env: Env, username: string, includeUnreleased: boolean = false): Promise<StudentState[] | null> {
  const sensei = await getSenseiByUsername(env, username);
  if (!sensei) {
    return null;
  }

  const rawStates = await env.KV_USERDATA.get(userStateKeyById(sensei.id));
  const allStudents = await getStudentsMap(env, includeUnreleased);
  const states = (rawStates ? JSON.parse(rawStates) : []) as StudentState[];
  return Object.entries(allStudents).map(([studentId, student]) => {
    const state = states.find((state) => state.student.id === studentId);
    if (state) {
      return { ...state, student };
    } else {
      return { student, owned: false, tier: student.initialTier };
    }
  });
}

export async function filterSenseisByStudent(
  env: Env, studentId: string, minTier: number
): Promise<{ senseiId: number, tier: number }[]> {
  const list = await env.KV_USERDATA.list({ prefix: "student-states:id:" });

  const result: { senseiId: number, tier: number }[] = [];
  await Promise.all(list.keys.map(async (key) => {
    const rawStates = await env.KV_USERDATA.get(key.name);
    if (!rawStates) {
      return;
    }

    const states = (rawStates ? JSON.parse(rawStates) : []) as StudentState[];
    const state = states.find((state) => state.student.id === studentId);
    if (state && state.owned && state.tier && state.tier >= minTier) {
      result.push({ senseiId: parseInt(key.name.split(":")[2]), tier: state.tier });
    }
  }));
  return result;
}

export async function updateStudentStates(env: Env, sensei: Sensei, states: StudentState[]) {
  await env.KV_USERDATA.put(userStateKeyById(sensei.id), JSON.stringify(states));
}
