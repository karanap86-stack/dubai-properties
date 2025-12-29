import React, { createContext, useState, useEffect } from 'react'
import { getAllProjects } from '../services/projectService'

export const ProjectContext = createContext()

export function ProjectProvider({ children }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const loadProjects = async () => {
      try {
        const data = await getAllProjects()
        if (isMounted) setProjects(data)
      } catch (error) {
        console.error('Error loading projects:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    loadProjects()

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      loadProjects()
    }, 5 * 60 * 1000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [])

  return (
    <ProjectContext.Provider value={{ projects, loading, setProjects }}>
      {children}
    </ProjectContext.Provider>
  )
}
