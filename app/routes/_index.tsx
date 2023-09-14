import { redirect, type ActionFunction, type V2_MetaFunction } from "@remix-run/cloudflare";
import { Form } from "@remix-run/react";
import { ArrowRight } from "iconoir-react";
import { useState } from "react";
import { Button, Input } from "~/components/atoms/form";
import Title from "~/components/atoms/typography/Title";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "MyMollu" },
    { name: "description", content: "Share your blue archive specs and get feedbacks from your friends." },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  return redirect(`/@${username.replace("@", "")}`);
};

export default function Index() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <Title text="학생부" />
      <div className="my-4 flex items-center text-xl cursor-pointer hover:underline">
        <span>내 학생부</span>
        <ArrowRight className="h-5 w-5 ml-1" strokeWidth={2} />
      </div>
      <div
        className="my-4 flex items-center text-xl cursor-pointer hover:underline"
        onClick={() => { setShowSearch(true) }}
      >
        <span>다른 선생님의 학생부</span>
        <ArrowRight className="h-5 w-5 ml-1" strokeWidth={2} />
      </div>
      {showSearch && (
        <Form method="post">
          <Input name="username" placeholder="@username" />
          <Button type="submit" text="찾기" color="primary" />
        </Form>
      )}
    </>
  );
}
