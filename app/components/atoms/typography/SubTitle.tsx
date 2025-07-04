export default function SubTitle({ text, className }: { text: string, className?: string }) {
  return (
    <h2 className={`first:mt-4 mt-12 mb-4 font-bold text-xl ${className ?? ""}`}>{text}</h2>
  );
}
