import { MoonIcon, EnvelopeIcon, MegaphoneIcon } from "@heroicons/react/16/solid";
import {
  HomeIcon as HomeIconOutline,
  CalendarIcon as CalendarIconOutline,
  UserCircleIcon as UserCircleIconOutline,
  PencilSquareIcon as PencilSquareIconOutline,
  IdentificationIcon as IdentificationIconOutline,
  Bars3Icon,
  Cog6ToothIcon as Cog6ToothIconOutline,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  CalendarIcon as CalendarIconSolid,
  UserCircleIcon as UserCircleIconSolid,
  PencilSquareIcon as PencilSquareIconSolid,
  IdentificationIcon as IdentificationIconSolid,
  Cog6ToothIcon as Cog6ToothIconSolid,
} from "@heroicons/react/24/solid";
import { Transition } from "@headlessui/react";
import { Link, useMatches, useSubmit } from "react-router";
import { useState } from "react";
import { useSignIn } from "~/contexts/SignInProvider";
import { sanitizeClassName } from "~/prophandlers";
import { submitPreference } from "~/routes/api.preference";

interface MenuItemProps {
  to: string;
  name: string;
  OutlineIcon: React.ComponentType<React.ComponentProps<"svg">>;
  SolidIcon: React.ComponentType<React.ComponentProps<"svg">>;
  isActive: boolean;
  onItemClick?: () => void;
}

function MenuItem({ to, name, OutlineIcon, SolidIcon, isActive, onItemClick }: MenuItemProps) {
  return (
    <Link
      to={to}
      className={sanitizeClassName(`my-2 p-2 flex items-center hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition ${isActive ? "font-bold drop-shadow-lg" : ""}`)}
      onClick={() => onItemClick?.()}
    >
      {isActive ? <SolidIcon className="inline-block mr-3 size-6" /> : <OutlineIcon className="inline-block mr-3 size-6" />}
      <span className="text-lg">{name}</span>
    </Link>
  );
}

interface MenuContentProps {
  currentUsername: string | null;
  currentRole: string | null;
  pathname: string;
  onMenuClose: () => void;
  onShowSignIn: () => void;
  onDarkModeToggle: (fn: (prev: boolean) => boolean) => void;
  hasRecentNews: boolean;
}

function MenuContent({ currentUsername, currentRole, pathname, onMenuClose, onShowSignIn, onDarkModeToggle, hasRecentNews }: MenuContentProps) {
  const submit = useSubmit();

  return (
    <>
      <MenuItem
        to="/"
        name="홈"
        OutlineIcon={HomeIconOutline}
        SolidIcon={HomeIconSolid}
        isActive={pathname === "/"}
        onItemClick={onMenuClose}
      />
      <MenuItem
        to="/futures"
        name="미래시"
        OutlineIcon={CalendarIconOutline}
        SolidIcon={CalendarIconSolid}
        isActive={pathname.startsWith("/futures") || pathname.startsWith("/events") || pathname.startsWith("/raids")}
        onItemClick={onMenuClose}
      />
      <MenuItem
        to="/students"
        name="학생부"
        OutlineIcon={IdentificationIconOutline}
        SolidIcon={IdentificationIconSolid}
        isActive={pathname.startsWith("/students")}
        onItemClick={onMenuClose}
      />
      {currentUsername ? (
        <>
          <MenuItem
            to={`/@${currentUsername}`}
            name="내 정보"
            OutlineIcon={UserCircleIconOutline}
            SolidIcon={UserCircleIconSolid}
            isActive={pathname.startsWith("/@")}
            onItemClick={onMenuClose}
          />
          <MenuItem
            to="/edit"
            name="프로필 관리"
            OutlineIcon={PencilSquareIconOutline}
            SolidIcon={PencilSquareIconSolid}
            isActive={pathname.startsWith("/edit")}
            onItemClick={onMenuClose}
          />
          {currentRole === "admin" && (
            <MenuItem
              to="/dash"
              name="관리자"
              OutlineIcon={Cog6ToothIconOutline}
              SolidIcon={Cog6ToothIconSolid}
              isActive={pathname.startsWith("/dash")}
              onItemClick={onMenuClose}
            />
          )}
        </>
      ) : (
        <div
          className="w-full my-4 py-3 bg-neutral-800 dark:bg-neutral-100 text-white dark:text-neutral-900 text-center rounded-full hover:opacity-50 transition-opacity cursor-pointer"
          onClick={() => {
            onShowSignIn();
            onMenuClose();
          }}
        >
          로그인 후 내 정보 관리
        </div>
      )}

      <div className="py-2" />

      <Link
        to="/news"
        className="w-fit my-1.5 py-1 px-2 flex items-center text-neutral-500 dark:text-neutral-400 cursor-pointer hover:underline relative"
        onClick={onMenuClose}
      >
        <MegaphoneIcon className="size-4" />
        <span className="ml-2">업데이트 소식</span>
        {hasRecentNews && (
          <div className="absolute top-1 -right-1 size-1.5 bg-red-500 rounded-full animate-pulse" />
        )}
      </Link>
      {currentUsername && (
        <Link
          to="/contact"
          className="w-fit my-1.5 py-1 px-2 flex items-center text-neutral-500 dark:text-neutral-400 cursor-pointer hover:underline"
          onClick={onMenuClose}
        >
          <EnvelopeIcon className="size-4" />
          <span className="ml-2">제안/문의</span>
        </Link>
      )}
      <div
        className="w-fit my-1.5 py-1 px-2 font-bold flex items-center text-yellow-600 dark:text-yellow-400 cursor-pointer hover:underline"
        onClick={() => {
          onDarkModeToggle((prev) => {
            submitPreference(submit, { darkMode: !prev });
            return !prev;
          });
        }}
      >
        <MoonIcon className="size-4" />
        <span className="ml-2">다크 모드</span>
      </div>
    </>
  );
}

type SidebarProps = {
  currentUsername: string | null;
  currentRole: string | null;
  darkMode: boolean;
  setDarkMode: (fn: (prev: boolean) => boolean) => void;
  hasRecentNews: boolean;
};

export default function Sidebar({ currentUsername, currentRole, darkMode, setDarkMode, hasRecentNews }: SidebarProps) {
  const matches = useMatches();
  const pathname = matches[matches.length - 1].pathname;

  const { showSignIn } = useSignIn();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="px-4 py-4 xl:py-8">
      <div className="flex items-center">
        <Bars3Icon className="p-2 -m-2 block xl:hidden size-10" strokeWidth={2} onClick={() => setIsMenuOpen(!isMenuOpen)} />
        <img src={darkMode ? "/logo-dark.png" : "/logo-light.png"} alt="몰루로그 로고" className="ml-2 mr-1 xl:mr-2 object-cover h-8 xl:h-10 aspect-4/3" />
        <h1 className="text-2xl xl:text-3xl font-ingame">
          <span className="font-bold">몰루</span>로그
        </h1>
      </div>
      <div className="mt-6 hidden xl:block">
        <MenuContent
          currentUsername={currentUsername}
          currentRole={currentRole}
          pathname={pathname}
          onMenuClose={handleMenuClose}
          onShowSignIn={showSignIn}
          onDarkModeToggle={setDarkMode}
          hasRecentNews={hasRecentNews}
        />
      </div>
      <Transition
        show={isMenuOpen}
        as="div"
        enter="transition duration-200 ease-out"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition duration-100 ease-in"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="mt-6 block xl:hidden"
      >
        <MenuContent
          currentUsername={currentUsername}
          currentRole={currentRole}
          pathname={pathname}
          onMenuClose={handleMenuClose}
          onShowSignIn={showSignIn}
          onDarkModeToggle={setDarkMode}
          hasRecentNews={hasRecentNews}
        />
      </Transition>
    </div>
  );
}
