/** Build a readable profile narrative from registry fields (no external AI). */

export function composeProfileStory(input: {
  fullName: string;
  craft: string | null;
  tribe: string | null;
  location: string;
  experienceYears: number | null;
  groupName: string | null;
  trainingNeeds: string | null;
  notes: string | null;
}): string {
  if (input.notes?.trim()) return input.notes.trim();

  const parts: string[] = [];
  const name = input.fullName.split(' ')[0] ?? input.fullName;

  if (input.craft) {
    parts.push(
      `${name} practises ${input.craft.toLowerCase()}${input.experienceYears ? ` with ${input.experienceYears} years of experience` : ''}.`,
    );
  } else {
    parts.push(`${name} is registered on Adi Setu as a tribal artisan.`);
  }

  if (input.tribe) {
    parts.push(`They belong to the ${input.tribe} community.`);
  }

  if (input.location) {
    parts.push(`Based in ${input.location}, they continue traditional craft work in their local ecosystem.`);
  }

  if (input.groupName) {
    parts.push(`Associated with ${input.groupName}.`);
  }

  if (input.trainingNeeds) {
    parts.push(`Training interests noted: ${input.trainingNeeds}.`);
  }

  return parts.join(' ');
}
