const fs = require('fs');
const file = 'app/features/autofill-wizard/components/Step3Review.tsx';
let code = fs.readFileSync(file, 'utf8');

const groupingLogic = `
  const groupMappings = (mappings: FieldMapping[]) => {
    const groups = new Map<string, FieldMapping[]>();
    mappings.forEach(m => {
      const groupKey = (m.type === 'CheckBox' && m.label) ? \`group_\${m.label}\` : \`single_\${m.pdfFieldName}\`;
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(m);
    });
    return Array.from(groups.values());
  };

  const missingGroups = groupMappings(missingMappings);
  const filledGroups = groupMappings(filledMappings);
`;

code = code.replace(
  "const handleInputChange = (pdfFieldName: string, value: string) => {",
  groupingLogic + "\n  const handleInputChange = (pdfFieldName: string, value: string) => {"
);

const missingReplace = `
          <div className="space-y-4">
            {missingGroups.map((group, idx) => {
              const first = group[0];
              if (first.type === 'CheckBox') {
                return (
                  <div key={idx} className="bg-white rounded-lg p-4 border border-amber-100 shadow-sm">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">{first.label}</label>
                    <div className="pt-1 flex flex-wrap gap-2">
                      {group.map((m, mIdx) => (
                        <button
                          key={\`\${m.pdfFieldName}-\${mIdx}\`}
                          type="button"
                          onClick={() => handleInputChange(m.pdfFieldName, m.userValue === 'Yes' ? '' : 'Yes')}
                          className={\`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer \${
                            m.userValue === 'Yes'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm hover:bg-indigo-100'
                              : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                          }\`}
                        >
                          {m.userValue === 'Yes' ? (
                            <CheckCircle className="w-4 h-4 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 shrink-0 rounded-full border-2 border-slate-300" />
                          )}
                          <span>{m.displayValue || (m.userValue === 'Yes' ? 'Yes' : 'Select')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              }

              const m = first;
              return (
                <div key={idx} className="bg-white rounded-lg p-4 border border-amber-100 shadow-sm">
                  <label className="block text-sm font-semibold text-slate-900 mb-2">{m.label}</label>
                  {m.type === 'RadioGroup' && m.options ? (
                    <div className="pt-1 flex flex-wrap gap-2">
                      {m.options.map((option, optIdx) => {
                        const isOptionSelected = m.userValue === option;
                        const displayLabel = m.radioOptionsMap?.[option] || option;
                        return (
                          <button
                            key={\`\${option}-\${optIdx}\`}
                            type="button"
                            onClick={() => handleInputChange(m.pdfFieldName, isOptionSelected ? '' : option)}
                            className={\`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border transition-colors cursor-pointer \${
                              isOptionSelected
                                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm hover:bg-indigo-100'
                                : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                            }\`}
                          >
                            {isOptionSelected ? (
                              <CheckCircle className="w-4 h-4 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 shrink-0 rounded-full border-2 border-slate-300" />
                            )}
                            <span>{displayLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="w-full border border-slate-300 rounded-lg px-4 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      value={m.userValue || ''}
                      onChange={(e) => handleInputChange(m.pdfFieldName, e.target.value)}
                      placeholder={\`Enter \${m.label}\`}
                    />
                  )}
                </div>
              );
            })}
          </div>
`;

code = code.replace(/<div className="space-y-4">\s*\{missingMappings\.map\(\(m, idx\) => \([\s\S]*?\}\)\}\s*<\/div>/, missingReplace.trim());

const filledReplace = `
          <div className="space-y-4">
            {filledGroups.map((group, idx) => {
              const first = group[0];
              const displayValues = group.map(m => m.displayValue || m.userValue).join(', ');
              return (
                <div key={idx} className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  <span className="text-sm font-medium text-slate-600">{first.label}</span>
                  <span className="text-sm font-semibold text-slate-900 bg-white px-3 py-1 rounded border border-slate-200 text-right">
                    {displayValues}
                  </span>
                </div>
              );
            })}
          </div>
`;

code = code.replace(/<div className="space-y-4">\s*\{filledMappings\.map\(\(m, idx\) => \([\s\S]*?\}\)\}\s*<\/div>/, filledReplace.trim());

fs.writeFileSync(file, code);
console.log('Done');
