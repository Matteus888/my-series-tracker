"use client";

import styles from "./ProfileMenu.module.css";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Icon from "@mdi/react";
import { mdiAccount } from "@mdi/js";
import { usePopover } from "@/hooks/usePopover";
import ProfileMenuDropdown from "../ProfileMenuDropdown/ProfileMenuDropdown";
import LoginPopover from "@/components/ui/LoginPopover/LoginPopover";

export default function ProfileMenu() {
  const { data: session } = useSession();
  const menuPopover = usePopover();
  const loginPopover = usePopover();

  const pathname = usePathname();
  const isSettingsPage = pathname.startsWith("/settings");

  const handleLoginClick = () => {
    menuPopover.close();
    loginPopover.open();
  };

  return (
    <div className={styles.wrapper}>
      {/* Icône profil */}
      <div
        className={`${styles.avatar} ${menuPopover.isOpen || loginPopover.isOpen || isSettingsPage ? styles.avatarActive : ""}`}
        onClick={menuPopover.toggle}
        title={session ? session.user.name : "Account"}
      >
        {session?.user?.profilePicture && session.user.profilePicture !== "/images/default-profile.png" ? (
          <Image
            src={session.user.profilePicture}
            alt="profile"
            width={34}
            height={34}
            className={styles.avatarImage}
            priority
          />
        ) : (
          <Icon path={mdiAccount} size={1} />
        )}
      </div>
      {/* Menu déroulant */}
      {menuPopover.isOpen && (
        <ProfileMenuDropdown
          session={session}
          popoverRef={menuPopover.popoverRef}
          onClose={menuPopover.close}
          onLoginClick={handleLoginClick}
        />
      )}
      {/* Login Popover */}
      {loginPopover.isOpen && <LoginPopover onClose={loginPopover.close} popoverRef={loginPopover.popoverRef} />}
    </div>
  );
}
