import React from 'react';
import { renderAbilityTemplate } from '../../../../utils/renderAbilityTemplate';
import type { ItemAbilityState } from '../../../../types/domain/itemState';
import styles from './AbilityPanel.module.css';

interface AbilityPanelProps {
  abilities: ItemAbilityState[];
}

export const AbilityPanel: React.FC<AbilityPanelProps> = ({ abilities }) => {
  if (abilities.length === 0) return null;
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>アビリティ</h2>
      <div className={styles.list}>
        {abilities.map((ability) => (
          <div key={ability.key} className={styles.ability}>
            <div className={styles.abilityHeader}>
              <span className={`${styles.kind} ${styles[ability.kind]}`}>
                {ability.kind === 'passive' ? '自動効果' : '発動効果'}
              </span>
              <span className={styles.abilityName}>{ability.nameJa}</span>
              {ability.cooldown !== undefined && (
                <span className={styles.cooldown}>CD {ability.cooldown}秒</span>
              )}
            </div>
            <p className={styles.description}>
              {renderAbilityTemplate(ability.descriptionJa, ability.params)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
