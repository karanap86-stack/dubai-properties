import React, { createContext, useState, useEffect } from 'react'
import { getAllProjects } from '../services/projectService'

export const ProjectContext = createContext()

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getAllProjects()
        setProjects(data)
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  return (
    <ProjectContext.Provider value={{ projects, loading, setProjects }}>
      {children}
    </ProjectContext.Provider>
  )
}
