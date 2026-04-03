"use client";

import styles from "./PasswordInput.module.css";
import { useState } from "react";
import Icon from "@mdi/react";
import { mdiEyeOutline, mdiEyeOffOutline } from "@mdi/js";

export default function PasswordInput({ value, onChange, placeholder, classname, ...props }) {
  const [show, setShow] = useState(false);

  return (
    <div className={styles.wrapper}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        className={`${classname} ${styles.input}`}
        placeholder={placeholder}
        {...props}
      />
      <button
        type="button"
        className={styles.toggle}
        onClick={() => setShow((prev) => !prev)}
        tabIndex={-1}
        title={show ? "Hide password" : "Show password"}
      >
        <Icon path={show ? mdiEyeOffOutline : mdiEyeOutline} size={0.75} />
      </button>
    </div>
  );
}
