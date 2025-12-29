import { getAllProjects } from '../services/projectService';

describe('getAllProjects', () => {
  it('should return an array of projects including commercial and residential', async () => {
    const projects = await getAllProjects();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
    // Check at least one commercial and one residential
    const hasCommercial = projects.some(p => p.type);
    const hasResidential = projects.some(p => !p.type);
    expect(hasCommercial).toBe(true);
    expect(hasResidential).toBe(true);
  });
});
