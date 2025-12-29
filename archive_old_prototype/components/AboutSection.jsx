import React from 'react'
import { Linkedin } from 'lucide-react'

export default function AboutSection() {
  return (
    <section className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl font-bold" style={{ color: '#0a2e6d' }}>About Karan Ashutosh Poptani</h2>
      <div className="flex flex-col items-center gap-4 mb-8">
        <img
          src="https://media.licdn.com/dms/image/v2/D4D03AQFFmrtLaxnLWw/profile-displayphoto-scale_200_200/B4DZe7w0uBGUAY-/0/1751201830340?e=2147483647&v=beta&t=kjden09GbXIb1wDoYP4QSDTyD51u151XQsQ8xhtShJY"
          alt="Karan Ashutosh Poptani"
          className="w-32 h-32 rounded-full object-cover border-4 shadow-lg mx-auto"
          style={{ borderColor: '#00e676' }}
        />
        <span className="font-semibold text-lg" style={{ color: '#00e676' }}>Developed by Karan Ashutosh Poptani</span>
      </div>
      <p className="text-lg mb-6" style={{ color: '#0a2e6d' }}>
        <span className="font-bold" style={{ color: '#00e676' }}>Career Summary:</span> <br />
        Karan Ashutosh Poptani is a passionate real estate technology innovator with expertise in AI-driven solutions, digital transformation, and luxury property marketing. With a strong background in software engineering, product development, and market analysis, Karan has helped shape the future of real estate transactions in Dubai and beyond.
      </p>
      <div className="mb-6">
        <span className="font-bold" style={{ color: '#00e676' }}>Skills & Expertise:</span>
        <ul className="text-base mt-2 list-disc list-inside" style={{ color: '#0a2e6d' }}>
          <li>AI-powered real estate platforms</li>
          <li>Luxury property marketing & branding</li>
          <li>Market insights & analytics</li>
          <li>Software engineering & product design</li>
          <li>Client engagement & personalized solutions</li>
        </ul>
      </div>
      <div className="mb-8">
        <span className="font-bold" style={{ color: '#00e676' }}>Vision:</span>
        <p className="mt-2" style={{ color: '#0a2e6d' }}>
          My vision is to make real estate transactions easy, personalized, and hassle-free for every client. By leveraging AI and modern technology, I aim to deliver seamless, transparent, and insightful experiences that empower buyers, sellers, and investors to make confident decisions.
        </p>
      </div>
      <div className="mb-8">
        <span className="font-bold" style={{ color: '#00e676' }}>LinkedIn & Contact:</span>
        <div className="flex flex-col items-center gap-2 mt-2">
          <a href="https://www.linkedin.com/in/karan-poptani-282a78118" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg font-medium" style={{ color: '#00e676' }}>
            <Linkedin size={24} />
            LinkedIn: karan-poptani-282a78118
          </a>
          <span style={{ color: '#0a2e6d' }}>Phone: <span style={{ color: '#00e676' }}>+91 7028923314</span></span>
          <span style={{ color: '#0a2e6d' }}>Email: <span style={{ color: '#00e676' }}>karanap86@gmail.com</span></span>
        </div>
      </div>
      <div className="mb-8">
        {/* Market Insights & Thought Leadership section intentionally removed as per strategy. */}
      </div>
      <p className="text-sm" style={{ color: '#0a2e6d' }}>All rights reserved &copy; {new Date().getFullYear()} Karan Ashutosh Poptani</p>
    </section>
  )
}
