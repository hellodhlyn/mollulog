import { Bars3Icon } from "@heroicons/react/24/outline";
import { useMatches } from "react-router";
import { NavigationLink } from "~/components/atoms/navigation";

type NavigationProps = {
  links: {
    to: string;
    text: string;
    pathAliases?: string[];
    allowPathPrefix?: boolean;
  }[];
}

export default function Navigation({ links }: NavigationProps) {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;
  return (
    <div className="flex w-full mt-4 md:mt-8 mb-4 text-neutral-700 dark:text-neutral-200 items-center gap-x-1">
      <Bars3Icon className="flex-none mr-2 my-2 h-5 w-5" strokeWidth={2} />
      <div className="py-2 flex flex-nowrap overflow-x-auto">
        {links.map(({ to, text, pathAliases, allowPathPrefix }) => {
          const pathsToMatch = [to, ...(pathAliases ?? [])];
          const active = pathsToMatch.find((path) => allowPathPrefix ? pathname.startsWith(path) : pathname === path) !== undefined;
          return (
            <NavigationLink key={`nav-${to}`} to={to} text={text} active={active} />
          );
        })}
      </div>
    </div>
  );
}
