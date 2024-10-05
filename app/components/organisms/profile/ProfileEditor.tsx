import postposition from "cox-postposition";
import { useState } from "react";
import { Input, Button } from "~/components/atoms/form";
import { StudentSearch } from "~/components/molecules/student";
import { studentImageUrl } from "~/models/assets";

type ProfileStudent = {
  studentId: string;
  name: string;
};

type ProfileEditorProps = {
  students: ProfileStudent[];
  initialData?: {
    username: string;
    profileStudentId: string | null;
    friendCode: string | null;
  };
  error?: {
    username?: string;
    friendCode?: string;
  };
}

export default function ProfileEditor({ students, initialData, error }: ProfileEditorProps) {
  const [profileStudent, setProfileStudent] = useState<ProfileStudent | null>(
    initialData?.profileStudentId ? students.find(({ studentId }) => initialData.profileStudentId === studentId) ?? null : null
  );

  return (
    <>
      <Input
        name="username" label="닉네임" defaultValue={initialData?.username}
        error={error?.username}
        description="4~20글자의 영숫자 및 _ 기호를 이용할 수 있어요."
      />

      <div className="max-w-2xl">
        <StudentSearch
          label="프로필 학생"
          placeholder="이름으로 찾기..."
          description="학생을 프로필 학생으로 선택할 수 있어요."
          students={students}
          onSelect={(id) => setProfileStudent(students.find((student) => student.studentId === id)!)}
        />
        {profileStudent && (
          <>
            <div className="my-8 flex items-center px-4 py-2 bg-neutral-100 rounded-lg">
              <img
                className="h-12 w-12 mr-4 rounded-full object-cover"
                src={studentImageUrl(profileStudent.studentId)}
                alt={profileStudent.name}
              />
              <p><span className="font-bold">{profileStudent.name}</span>{postposition.pick(profileStudent.name, "을")} 선택했어요.</p>
            </div>
            <input type="hidden" name="profileStudentId" value={profileStudent.studentId} />
          </>
        )}
      </div>

      <Input
        name="friendCode" label="친구 코드 (선택)" defaultValue={initialData?.friendCode ?? undefined}
        error={error?.friendCode}
        description="게임 내 [소셜] > [친구] > [ID 카드] 에서 확인할 수 있어요."
      />

      <Button type="submit" text="완료" color="primary" className="mb-8 md:mb-16" />
    </>
  );
}
