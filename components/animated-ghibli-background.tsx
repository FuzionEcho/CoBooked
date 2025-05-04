"use client"

import { useEffect, useRef } from "react"
import { useTheme } from "next-themes"

export function AnimatedGhibliBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Colors
    const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7)
    skyGradient.addColorStop(0, "#87CEEB") // Light blue
    skyGradient.addColorStop(1, "#ADD8E6") // Slightly darker blue

    const seaGradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height)
    seaGradient.addColorStop(0, "#4682B4") // Steel blue
    seaGradient.addColorStop(1, "#1E3A8A") // Dark blue

    // Cloud class - the only animated element
    class Cloud {
      x: number
      y: number
      width: number
      height: number
      speed: number

      constructor() {
        this.width = Math.random() * 200 + 100
        this.height = this.width * 0.6
        this.x = Math.random() * (canvas.width + 200) - 100
        this.y = Math.random() * (canvas.height * 0.5)
        this.speed = Math.random() * 0.5 + 0.1
      }

      draw() {
        if (!ctx) return

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.height / 2, 0, Math.PI * 2)
        ctx.arc(this.x + this.width * 0.25, this.y - this.height * 0.1, this.height / 2.5, 0, Math.PI * 2)
        ctx.arc(this.x + this.width * 0.5, this.y, this.height / 2, 0, Math.PI * 2)
        ctx.arc(this.x + this.width * 0.75, this.y - this.height * 0.1, this.height / 2.5, 0, Math.PI * 2)
        ctx.arc(this.x + this.width, this.y, this.height / 2, 0, Math.PI * 2)
        ctx.fill()
      }

      update() {
        this.x += this.speed
        if (this.x > canvas.width + this.width) {
          this.x = -this.width
        }
      }
    }

    // Draw lighthouse (static)
    const drawLighthouse = () => {
      if (!ctx) return

      const baseX = canvas.width * 0.95
      const baseY = canvas.height * 0.7
      const width = 40
      const height = 150

      // Base of lighthouse
      ctx.fillStyle = "#8B4513" // Brown
      ctx.beginPath()
      ctx.moveTo(baseX - width * 1.5, baseY)
      ctx.lineTo(baseX + width * 1.5, baseY)
      ctx.lineTo(baseX + width, baseY - height * 0.1)
      ctx.lineTo(baseX - width, baseY - height * 0.1)
      ctx.closePath()
      ctx.fill()

      // Lighthouse tower
      ctx.fillStyle = "#FFFFFF"
      ctx.beginPath()
      ctx.moveTo(baseX - width / 2, baseY - height * 0.1)
      ctx.lineTo(baseX + width / 2, baseY - height * 0.1)
      ctx.lineTo(baseX + width / 3, baseY - height)
      ctx.lineTo(baseX - width / 3, baseY - height)
      ctx.closePath()
      ctx.fill()

      // Lighthouse stripes
      ctx.fillStyle = "#FF0000"
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        const stripeY = baseY - height * 0.1 - height * 0.2 * (i + 1)
        const stripeWidth = width / 2 - (width / 6) * (i + 1)
        ctx.rect(baseX - stripeWidth, stripeY, stripeWidth * 2, height * 0.1)
        ctx.fill()
      }

      // Lighthouse top
      ctx.fillStyle = "#333333"
      ctx.beginPath()
      ctx.arc(baseX, baseY - height, width / 3, 0, Math.PI * 2)
      ctx.fill()

      // Lighthouse light - only in dark mode (static)
      if (theme === "dark") {
        // Lighthouse light
        ctx.fillStyle = "#FFFF00"
        ctx.beginPath()
        ctx.arc(baseX, baseY - height, width / 4, 0, Math.PI * 2)
        ctx.fill()

        // Light beam (static)
        const gradient = ctx.createRadialGradient(baseX, baseY - height, 0, baseX, baseY - height, canvas.width * 0.5)
        gradient.addColorStop(0, "rgba(255, 255, 0, 0.8)")
        gradient.addColorStop(0.1, "rgba(255, 255, 0, 0.3)")
        gradient.addColorStop(0.2, "rgba(255, 255, 0, 0.1)")
        gradient.addColorStop(1, "rgba(255, 255, 0, 0)")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.moveTo(baseX, baseY - height)
        ctx.lineTo(baseX - canvas.width * 0.4, baseY - height * 2)
        ctx.lineTo(baseX - canvas.width * 0.3, baseY - height * 3)
        ctx.lineTo(baseX, baseY - height)
        ctx.fill()
      } else {
        // Just a window in light mode (static)
        ctx.fillStyle = "#87CEEB" // Light blue window
        ctx.beginPath()
        ctx.arc(baseX, baseY - height, width / 5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Create clouds - the only animated elements
    const clouds: Cloud[] = []
    for (let i = 0; i < 10; i++) {
      clouds.push(new Cloud())
    }

    // Draw static ocean (no waves)
    const drawOcean = () => {
      if (!ctx) return

      // Draw sea - adjust based on theme
      const seaColor =
        theme === "dark" ? ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height) : seaGradient

      if (theme === "dark") {
        seaColor.addColorStop(0, "#1E3A8A") // Navy blue
        seaColor.addColorStop(1, "#0F172A") // Dark blue
      }

      ctx.fillStyle = seaColor
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3)
    }

    // Animation loop - only clouds are animated
    const animate = () => {
      if (!ctx || !canvas) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw sky - adjust based on theme
      const skyColor = theme === "dark" ? ctx.createLinearGradient(0, 0, 0, canvas.height * 0.7) : skyGradient

      if (theme === "dark") {
        skyColor.addColorStop(0, "#0F172A") // Dark blue
        skyColor.addColorStop(1, "#1E3A8A") // Navy blue
      }

      ctx.fillStyle = skyColor
      ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7)

      // Draw static ocean
      drawOcean()

      // Draw cliff (static)
      ctx.fillStyle = "#8B4513" // Brown
      ctx.beginPath()
      ctx.moveTo(canvas.width * 0.85, canvas.height * 0.7)
      ctx.lineTo(canvas.width, canvas.height * 0.7)
      ctx.lineTo(canvas.width, canvas.height * 0.5)
      ctx.bezierCurveTo(
        canvas.width * 0.95,
        canvas.height * 0.5,
        canvas.width * 0.9,
        canvas.height * 0.6,
        canvas.width * 0.85,
        canvas.height * 0.7,
      )
      ctx.closePath()
      ctx.fill()

      // Draw beach (static)
      ctx.fillStyle = theme === "dark" ? "#D4D4D8" : "#F9FAFB" // Sand color
      ctx.beginPath()
      ctx.moveTo(0, canvas.height * 0.7)
      ctx.lineTo(canvas.width * 0.85, canvas.height * 0.7)
      ctx.lineTo(canvas.width * 0.7, canvas.height * 0.75)
      ctx.lineTo(canvas.width * 0.5, canvas.height * 0.72)
      ctx.lineTo(canvas.width * 0.4, canvas.height * 0.74)
      ctx.lineTo(canvas.width * 0.3, canvas.height * 0.71)
      ctx.lineTo(canvas.width * 0.2, canvas.height * 0.73)
      ctx.lineTo(canvas.width * 0.1, canvas.height * 0.72)
      ctx.lineTo(0, canvas.height * 0.74)
      ctx.closePath()
      ctx.fill()

      // Draw static lighthouse
      drawLighthouse()

      // Draw and update clouds (the only animated element)
      clouds.forEach((cloud) => {
        cloud.draw()
        cloud.update()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [theme]) // Add theme as a dependency to re-render when theme changes

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10" />
}
