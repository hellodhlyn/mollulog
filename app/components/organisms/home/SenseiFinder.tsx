import { Link, useNavigate } from "@remix-run/react";
import postposition from "cox-postposition";
import { Shuffle, UserBadgeCheck } from "iconoir-react";
import { useState } from "react";
import { SubButton } from "~/components/atoms/button";
import TierSelector from "~/components/molecules/editor/TierSelector";
import { StudentSearch } from "~/components/molecules/student";
import { studentImageUrl } from "~/models/assets";

type SearchableStudent = {
  studentId: string;
  name: string;
};

type SenseiFinderProps = {
  students: SearchableStudent[];
};

export default function SenseiFinder(
  { students }: SenseiFinderProps,
) {
  const [finder, setFinder] = useState<"student" | null>(null);
  const [searchedStudent, setSearchedStudent] = useState<SearchableStudent | null>(null);

  const navigate = useNavigate();

  return (
    <>
      <div className="flex gap-x-2">
        <Link to="/sensei/random">
          <SubButton>
            <Shuffle className="size-4" strokeWidth={2} />
            <span>무작위</span>
          </SubButton>
        </Link>
        <SubButton onClick={() => { finder === "student" ? setFinder(null) : setFinder("student") }}>
          <UserBadgeCheck className="size-4" strokeWidth={2} />
          <span>모집한 학생</span>
        </SubButton>
      </div>

      {finder === "student" && (
        <div className="my-4 border border-neutral-200 p-4 rounded-lg">
          <StudentSearch
            label="모집한 학생"
            placeholder="이름으로 찾기..."
            description="특정 학생을 모집한 선생님을 찾습니다."
            students={students}
            onSelect={(studentId) => { setSearchedStudent(students.find((student) => student.studentId === studentId) ?? null) }}
          />
          {searchedStudent && (
            <>
              <div className="my-4 flex items-center px-4 py-2 bg-neutral-100 rounded-lg">
                <img
                  className="h-12 w-12 mr-4 rounded-full object-cover"
                  src={studentImageUrl(searchedStudent.studentId)}
                  alt={searchedStudent.name}
                />
                <p><span className="font-bold">{searchedStudent.name}</span>{postposition.pick(searchedStudent.name, "을")} 선택했어요.</p>
              </div>
              <TierSelector
                text="최소 성급으로 찾기"
                onSelect={(tier) => navigate(`/sensei/search?studentId=${searchedStudent.studentId}&minTier=${tier}`)}
              />
            </>
          )}
        </div>
      )}
    </>
  );
}
