"use client";

import styles from "./ProfileMenuDropdown.module.css";
import Icon from "@mdi/react";
import { mdiLogin, mdiLogout, mdiAccountPlus, mdiCog, mdiCheck, mdiCancel, mdiAccountBoxOutline } from "@mdi/js";
import { signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { isProtectedRoute } from "@/lib/constants/routes.constants";

export default function ProfileMenuDropdown({ session, popoverRef, onClose, onLoginClick }) {
  const [showConfirmSignOut, setShowConfirmSignOut] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  const pathname = usePathname();

  const handleSignOut = async () => {
    setShowConfirmSignOut(false);

    if (isProtectedRoute(pathname)) {
      showToast("You have been signed out.");
      await signOut({ redirect: true, callbackUrl: "/series" });
    } else {
      await signOut({ redirect: false });
      showToast("You have been signed out.");
    }
  };

  const handleSignUp = () => {
    onClose();
    router.push("/signup");
  };

  const handleSettings = () => {
    onClose();
    router.push("/settings");
  };

  const handleProfile = () => {
    onClose();
    router.push(`/users/${session.user.name}`);
  };

  return (
    <div className={styles.menu} ref={popoverRef}>
      {session ? (
        <>
          <div className={styles.userInfo}>
            <span className={styles.username}>{session.user.name}</span>
            <span className={styles.email}>{session.user.email}</span>
          </div>
          <div className={styles.divider} />
          <button className={styles.menuItem} onClick={handleProfile}>
            <Icon path={mdiAccountBoxOutline} size={0.7} />
            <span className={styles.menuItemText}>Profile</span>
          </button>
          <button className={styles.menuItem} onClick={handleSettings}>
            <Icon path={mdiCog} size={0.7} />
            <span className={styles.menuItemText}>Settings</span>
          </button>
          <div className={styles.divider} />
          {!showConfirmSignOut ? (
            <button className={styles.menuItem} onClick={() => setShowConfirmSignOut(true)}>
              <Icon path={mdiLogout} size={0.7} />
              <span className={styles.menuItemText}>Sign out</span>
            </button>
          ) : (
            <div className={styles.confirmSignOut}>
              <p className={styles.confirmText}>Are you sure?</p>
              <div className={styles.confirmActions}>
                <span className={styles.confirmYes} onClick={handleSignOut}>
                  <Icon path={mdiCheck} size={0.8} />
                </span>
                <span className={styles.confirmNo} onClick={() => setShowConfirmSignOut(false)}>
                  <Icon path={mdiCancel} size={0.8} />
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          <button className={styles.menuItem} onClick={onLoginClick}>
            <Icon path={mdiLogin} size={0.7} />
            <span className={styles.menuItemText}>Log in</span>
          </button>
          <div className={styles.divider} />
          <button className={styles.menuItem} onClick={handleSignUp}>
            <Icon path={mdiAccountPlus} size={0.7} />
            <span className={styles.menuItemText}>Sign up</span>
          </button>
        </>
      )}
    </div>
  );
}
