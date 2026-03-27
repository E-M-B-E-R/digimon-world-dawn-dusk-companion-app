interface DnaRequirementsBoxProps {
  formattedReqs?: string;
  darkMode?: boolean;
}

export function DnaRequirementsBox({ formattedReqs, darkMode }: DnaRequirementsBoxProps) {
  return (
    <div className={`p-3 rounded-lg ${darkMode ? 'bg-[#49483e]' : 'bg-gray-50'}`}>
      <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-[#f8f8f2]' : 'text-gray-900'}`}>
        Requirements
      </div>
      <div className={`text-sm ${darkMode ? 'text-[#a6a49f]' : 'text-gray-600'}`}>
        {formattedReqs ? (
          formattedReqs.split('\n').map((line, i) => <div key={i}>{line}</div>)
        ) : (
          'No requirements'
        )}
      </div>
    </div>
  );
}
