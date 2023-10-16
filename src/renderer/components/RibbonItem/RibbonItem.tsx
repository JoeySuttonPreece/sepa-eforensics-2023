import React from 'react';
import cc from 'classcat';
import { type MenuItem } from '../Layout/Layout';
import styles from './RibbonItem.scss';

export default function RibbonItem({
  item,
  setStatus,
}: {
  item: MenuItem;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { label, icon: Icon, action, disabled } = item;
  const isDisabled = disabled === true || typeof disabled === 'string';

  let handleClick: VoidFunction | undefined;
  if (disabled === true) {
    handleClick = undefined;
  } else if (typeof disabled === 'string') {
    handleClick = () => setStatus(disabled);
  } else {
    handleClick = action;
  }

  return (
    <button
      className={cc([
        styles.ribbonItem,
        { [styles.ribbonItemDisabled]: isDisabled },
      ])}
      onClick={handleClick}
      type="button"
      role="menuitem"
      key={label}
    >
      <Icon className={styles.ribbonItemIcon} />
      <span className={styles.ribbonItemLabel}>{label}</span>
    </button>
  );
}
