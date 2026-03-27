interface TeamHeaderProps {
  teamName: string;
  isEditing: boolean;
  tempName: string;
  onTempNameChange: (name: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  darkMode: boolean;
  nameInputRef: React.RefObject<HTMLInputElement>;
}

export function TeamHeader({
  teamName,
  isEditing,
  tempName,
  onTempNameChange,
  onStartEdit,
  onSave,
  onKeyDown,
  darkMode,
  nameInputRef,
}: TeamHeaderProps) {
  if (isEditing) {
    return (
      <div className="flex items-center justify-center mb-6 gap-2">
        <input
          ref={nameInputRef}
          type="text"
          value={tempName}
          onChange={e => onTempNameChange(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={onSave}
          className={`text-3xl text-center font-medium rounded px-3 py-1 ${
            darkMode
              ? 'bg-[#49483e] text-[#f8f8f2] border border-[#75715e] focus:outline-none focus:ring-2 focus:ring-[#a6a49f]'
              : 'bg-gray-50 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        />
      </div>
    );
  }

  return (
    <h2
      onClick={onStartEdit}
      className={`text-3xl mb-6 text-center cursor-pointer hover:opacity-70 transition-opacity ${
        darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'
      }`}
      title="Click to rename your team"
    >
      {teamName}
    </h2>
  );
}
