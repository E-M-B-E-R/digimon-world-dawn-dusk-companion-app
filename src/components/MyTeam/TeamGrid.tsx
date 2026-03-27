import { Digimon } from '../../types/digimon';
import { TeamSlot } from './TeamSlot';

interface SlotData {
  index: number;
  digimon: Digimon | null;
}

interface TeamGridProps {
  slots: SlotData[];
  isDesktop: boolean;
  darkMode: boolean;
  themeColor: string;
  selectedSlot: number | null;
  onSlotClick: (index: number) => void;
  onRemove: (index: number, e: React.MouseEvent) => void;
  onSwitch: (index: number, e: React.MouseEvent) => void;
}

export function TeamGrid({
  slots,
  isDesktop,
  darkMode,
  themeColor,
  selectedSlot,
  onSlotClick,
  onRemove,
  onSwitch,
}: TeamGridProps) {
  return (
    <div
      className={`w-full flex justify-center ${isDesktop ? '' : 'px-2'}`}
      style={{ padding: isDesktop ? '0 40px' : undefined }}
    >
      <div
        style={{
          display: 'grid',
          width: isDesktop ? '600px' : '100%',
          maxWidth: isDesktop ? '600px' : '100%',
          gridTemplateColumns: isDesktop ? 'repeat(3, 200px)' : 'repeat(3, minmax(0, 1fr))',
          gridAutoFlow: 'row',
          gap: isDesktop ? '8px' : '4px',
          paddingBottom: isDesktop ? '40px' : '32px',
        }}
      >
        {slots.map(slot => (
          <TeamSlot
            key={slot.index}
            digimon={slot.digimon}
            index={slot.index}
            isSelected={selectedSlot === slot.index}
            isDesktop={isDesktop}
            themeColor={themeColor}
            darkMode={darkMode}
            onSlotClick={() => onSlotClick(slot.index)}
            onRemove={e => onRemove(slot.index, e)}
            onSwitch={e => onSwitch(slot.index, e)}
          />
        ))}
      </div>
    </div>
  );
}
