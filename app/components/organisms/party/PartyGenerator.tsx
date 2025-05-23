import { Link } from "react-router";
import dayjs from "dayjs";
import { useState } from "react";
import { Button, Input, Label, Textarea, Toggle } from "~/components/atoms/form";
import { SubTitle } from "~/components/atoms/typography";
import { AddContentButton, ContentSelector, PartyUnitEditor } from "~/components/molecules/editor";
import { StudentCards } from "~/components/molecules/student";
import { raidTypeLocale, terrainLocale } from "~/locales/ko";
import { bossImageUrl } from "~/models/assets";
import type { RaidType, Terrain } from "~/models/content";
import type { Party } from "~/models/party";
import type { StudentState } from "~/models/student-state";

type PartyGeneratorProps = {
  party?: Party;
  raids: {
    raidId: string;
    name: string;
    type: RaidType;
    boss: string;
    terrain: Terrain;
    since: Date;
    until: Date;
  }[];
  studentStates: StudentState[];
};

export default function PartyGenerator({ party, raids, studentStates }: PartyGeneratorProps) {
  const [raidId, setRaidId] = useState<string | undefined>(party?.raidId ?? undefined);

  const [showPartyEditor, setShowPartyEditor] = useState(false);
  const [units, setUnits] = useState<(string | null)[][]>(party?.studentIds ?? []);

  const now = dayjs();
  return (
    <div className="my-8">
      <SubTitle text="편성 만들기" />
      <Input name="name" label="편성 이름" placeholder="예) 비나 인세인 고점팟" defaultValue={party?.name} />

      <ContentSelector
        contents={raids.filter((raid) => dayjs(raid.until).isAfter(now)).map((raid) => ({
          ...raid,
          contentId: raid.raidId,
          description: `${dayjs(raid.since).format("YYYY-MM-DD")} | ${raidTypeLocale[raid.type]} | ${terrainLocale[raid.terrain]}`,
          imageUrl: bossImageUrl(raid.boss),
        }))}
        initialContentId={raidId}
        placeholder="편성을 사용할 컨텐츠를 선택하세요"
        onSelectContent={(contentId) => setRaidId(contentId)}
      />
      {raidId && (
        <>
          <input type="hidden" name="raidId" value={raidId} />
          <Toggle name="showAsRaidTip" label="컨텐츠 공략에 공개하기" initialState={party?.showAsRaidTip ?? false} />
        </>
      )}
 
      <div className="h-8" />
      <Textarea name="memo" label="편성 설명" placeholder="편성에 대한 설명을 적어주세요" defaultValue={party?.memo ?? undefined} />

      <SubTitle text="파티" />
      <input type="hidden" name="studentIds" value={JSON.stringify(units)} />
      {units.map((unit, index) => (
        <div className="my-4 px-4 py-2 md:px-6 md:py-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl" key={`party-unit-${index}`}>
          <Label text={`${index + 1}번째 파티`} />
          <StudentCards
            students={unit.map((studentId) => {
              const state = studentId ? studentStates.find(({ student }) => student.id === studentId) : null;
              return {
                studentId: state?.student?.id ?? null,
                name: state?.student?.name ?? undefined,
                tier: state?.owned ? (state.tier ?? state.student.initialTier) : undefined,
              };
            })}
            mobileGrid={6}
            pcGrid={12}
          />
          <div className="flex justify-end">
            <button
              type="button"
              className="py-2 px-4 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-red-500 font-bold transition rounded-lg"
              onClick={() => setUnits((prev) => prev.filter((_, i) => i !== index))}
            >
              삭제
            </button>
          </div>
        </div>
      ))}
      {showPartyEditor ?
        <PartyUnitEditor
          index={units.length}
          students={studentStates.map(({ student, owned, tier }) => ({
            studentId: student.id,
            name: student.name,
            role: student.role,
            tier: owned ? (tier ?? student.initialTier) : undefined,
          }))}
          onComplete={(studentIds) => {
            setUnits((prev) => [...prev, studentIds]);
            setShowPartyEditor(false);
          }}
          onCancel={() => setShowPartyEditor(false)}
        /> :
        <AddContentButton text="파티 추가하기" onClick={() => setShowPartyEditor(true)} />
      }

      <div className="flex gap-x-1">
        <Button type="submit" text="저장" color="primary" />
        <Button type="button" text="초기화" color="red" onClick={() => setUnits([])} />
        <Link to="/edit/parties">
          <Button type="button" text="취소" />
        </Link>
      </div>
    </div>
  );
}
