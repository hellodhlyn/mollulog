import { ActionFunction, LoaderFunction, V2_MetaFunction, json, redirect } from "@remix-run/cloudflare";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Authenticator } from "remix-auth";
import { Title } from "~/components/atoms/typography";
import { Events, ResourceCalculator } from "~/components/organisms/event";
import { Env } from "~/env.server";
import { PickupEvent, getFutureEvents } from "~/models/event";
import { FuturePlan, getFuturePlan, setFuturePlan } from "~/models/future";
import { Sensei } from "~/models/sensei";
import { Student, getAllStudents } from "~/models/student";
import { StudentResource, getStudentResource } from "~/models/student-resource";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "미래시 - MolluLog" },
    { name: "description", content: "블루 아카이브 한국 서버의 이벤트 및 픽업 일정을 확인하고 계획해보세요." },
  ];
};

type LoaderData = {
  signedIn: boolean;
  events: PickupEvent[];
  allStudents: Student[];
  futurePlan: FuturePlan | null;
  resources: StudentResource[];
};

export const loader: LoaderFunction = async ({ context, request }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const currentUser = await authenticator.isAuthenticated(request);

  const events = getFutureEvents();
  const eventStudentIds = events.flatMap(({ pickups }) => (
    pickups.map((student) => student.studentId)
  ));

  const env = context.env as Env;
  const signedIn = currentUser !== null;
  const futurePlan = signedIn ? await getFuturePlan(env, currentUser.id) : null;
  return json<LoaderData>({
    signedIn,
    events: getFutureEvents(),
    allStudents: getAllStudents(true).filter(({ id }) => eventStudentIds.includes(id)),
    futurePlan,
    resources: futurePlan?.studentIds?.map((id) => getStudentResource(id)!) ?? [],
  });
};

type ActionData = {
  resources: StudentResource[];
};

export const action: ActionFunction = async ({ context, request }) => {
  const authenticator = context.authenticator as Authenticator<Sensei>;
  const currentUser = await authenticator.isAuthenticated(request);
  if (!currentUser) {
    return redirect("/signin");
  }

  const formData = await request.formData();
  const studentIds = JSON.parse(formData.get("studentIds") as string) as string[];
  await setFuturePlan(context.env as Env, currentUser.id, {
    studentIds,
    memos: formData.get("memos") ? JSON.parse(formData.get("memos") as string) : undefined,
  });

  const resources = studentIds.map((id) => getStudentResource(id)!);
  return json<ActionData>({ resources });
};

export default function Futures() {
  const loaderData = useLoaderData<LoaderData>();
  const { signedIn, events, allStudents } = loaderData;
  const fetcher = useFetcher();

  const [plan, setPlan] = useState<FuturePlan>(loaderData.futurePlan ?? { studentIds: [] });
  useEffect(() => {
    if (!signedIn) {
      return;
    }

    const timer = setTimeout(() => {
      fetcher.submit(
        {
          studentIds: JSON.stringify(plan.studentIds),
          memos: plan.memos ? JSON.stringify(plan.memos) : null,
        },
        { method: "post", replace: false },
      );
    }, 500);

    return () => { clearTimeout(timer); };
  }, [plan]);

  const [resources, setResources] = useState<StudentResource[]>(loaderData.resources);
  useEffect(() => {
    if (fetcher.state === "loading" && fetcher.data) {
      const fetchedData = fetcher.data as ActionData;
      setResources(fetchedData.resources);
    }
  }, [fetcher]);


  const selectedPickups = events.flatMap((event) => event.pickups)
    .filter((pickup) => plan.studentIds.includes(pickup.studentId));

  return (
    <div className="pb-64">
      <Title text="미래시" />
      {signedIn ?
        <p>학생을 선택하여 성장에 필요한 재화량을 계산할 수 있어요.</p> :
        <p><Link to="/signin" className="underline">로그인</Link> 후 학생을 선택하여 필요한 재화량을 계산하고, 각 이벤트에 대한 메모를 남길 수 있어요.</p>
      }
      <Events
        events={events.map((event) => ({
          ...event,
          since: event.since ? new Date(Date.parse(event.since)) : null,
          until: event.until ? new Date(Date.parse(event.until)) : null,
          pickups: event.pickups.map((pickup) => ({
            student: allStudents.find(({ id }) => pickup.studentId === id)!,
            rerun: pickup.rerun,
            type: pickup.type,
          })),
        }))}
        selectedStudentIds={plan.studentIds}
        initialMemos={plan.memos}
        onSelect={signedIn ? (
          (studentId) => {
            const newSelectedIds = plan.studentIds.includes(studentId) ?
              plan.studentIds.filter((id) => id !== studentId) : [...plan.studentIds, studentId];
            setPlan((prev) => ({ ...prev, studentIds: newSelectedIds }));
          }
        ) : undefined}
        onMemoUpdate={signedIn ? (
          (eventId, text) => setPlan((prev) => ({ ...prev, memos: { ...prev.memos, [eventId]: text } }))
        ) : undefined}
      />

      {(plan.studentIds.length > 0) && (
        <div className="fixed w-screen bottom-0 left-0">
          <ResourceCalculator
            pickups={selectedPickups.map((pickup) => ({
              ...pickup,
              student: allStudents.find(({ id }) => id === pickup.studentId)!,
            }))}
            resources={resources}
            loading={fetcher.state === "submitting"}
          />
        </div>
      )}
    </div>
  );
}