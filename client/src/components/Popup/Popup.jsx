import React from 'react';
import styles from './Popup.module.css';  

function Popup({ trigger, setTrigger, children }) {
  return (
    trigger ? (
      <div className={styles.popupOverlay}>
        <div className={styles.popupContainer}>
          <button 
            className={styles.closeButton} 
            onClick={() => setTrigger(false)}>
            ✕
          </button>
          {children}
        </div>
      </div>
    ) : ""
  );
}

export default Popup;
