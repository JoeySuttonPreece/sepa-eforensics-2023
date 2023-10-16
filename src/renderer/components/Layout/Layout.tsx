import React, { createContext, useContext, useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import cc, { type Class } from 'classcat';
import RibbonItem from '../RibbonItem/RibbonItem';
import styles from './Layout.scss';

export type MenuItem = {
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  action?: VoidFunction;
  disabled?: boolean;
};

// export type Menu = MenuItem[];
export type Menu = {
  left: MenuItem[];
  right: MenuItem[];
};

export type LayoutContextType = {
  status: string;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  menuItems: Menu;
  setMenuItems: React.Dispatch<React.SetStateAction<Menu>>;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function useLayout() {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a Layout');
  }
  return context;
}

export default function Layout() {
  const [status, setStatus] = useState(
    'This is the status bar. Status and tooltips will be displayed here.'
  );
  const [menuItems, setMenuItems] = useState<Menu>({ left: [], right: [] });

  const value = useMemo(
    () => ({ status, setStatus, menuItems, setMenuItems }),
    [status, menuItems]
  );

  const ribbonItems = useMemo(
    () => (
      <>
        {menuItems.left.map((item) => (
          <RibbonItem item={item} setStatus={setStatus} />
        ))}
        {(menuItems.left.length > 0 || menuItems.right.length > 0) && (
          <div key="space" className={styles.ribbonSeparator} />
        )}
        {menuItems.right.map((item) => (
          <RibbonItem item={item} setStatus={setStatus} />
        ))}
      </>
    ),
    [menuItems]
  );

  return (
    <main className={styles.layout}>
      <LayoutContext.Provider value={value}>
        <div
          className={cc([
            styles.ribbon,
            {
              [styles.ribbonEmpty]:
                menuItems.left.length === 0 && menuItems.right.length === 0,
            },
          ])}
          role="menubar"
        >
          {ribbonItems}
        </div>
        <div className={styles.content}>
          <Outlet />
        </div>
        <div className={styles.statusBar}>{status}</div>
      </LayoutContext.Provider>
    </main>
  );
}
