import { useState } from "react";
import styles from "./Navbar.module.css";

export default function Navbar({ user, logout, badge }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}>
        <span className={styles.logo}>🚚</span>
        <span className={styles.title}>Vehicle Management</span>
        {badge && <span className={styles.badge}>{badge}</span>}
      </div>

      <button className={styles.hamburger} onClick={() => setOpen(!open)} aria-label="Toggle menu">
        <span className={`${styles.bar} ${open ? styles.barOpen : ""}`} />
        <span className={`${styles.bar} ${open ? styles.barOpen : ""}`} />
        <span className={`${styles.bar} ${open ? styles.barOpen : ""}`} />
      </button>

      <div className={`${styles.menu} ${open ? styles.menuOpen : ""}`}>
        <span className={styles.userInfo}>
          {user?.name} ({user?.role}){user?.city && ` — ${user.city}`}
        </span>
        <button onClick={logout} className={styles.logoutBtn}>Logout</button>
      </div>
    </nav>
  );
}
