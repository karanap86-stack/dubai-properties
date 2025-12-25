import React from 'react'
import { Linkedin } from 'lucide-react'

export default function AboutSection() {
  return (
    <section className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl font-bold text-white mb-4">About Karan Ashutosh Poptani</h2>
      <div className="flex flex-col items-center gap-4 mb-8">
        <img
          src="https://media.licdn.com/dms/image/v2/D4D03AQFFmrtLaxnLWw/profile-displayphoto-scale_200_200/B4DZe7w0uBGUAY-/0/1751201830340?e=2147483647&v=beta&t=kjden09GbXIb1wDoYP4QSDTyD51u151XQsQ8xhtShJY"
          alt="Karan Ashutosh Poptani"
          className="w-32 h-32 rounded-full object-cover border-4 border-cyan-400 shadow-lg mx-auto"
        />
        <span className="text-cyan-400 font-semibold text-lg">Developed by Karan Ashutosh Poptani</span>
      </div>
      <p className="text-lg text-gray-300 mb-6">
        <span className="font-bold text-white">Career Summary:</span> <br />
        Karan Ashutosh Poptani is a passionate real estate technology innovator with expertise in AI-driven solutions, digital transformation, and luxury property marketing. With a strong background in software engineering, product development, and market analysis, Karan has helped shape the future of real estate transactions in Dubai and beyond.
      </p>
      <div className="mb-6">
        <span className="font-bold text-white">Skills & Expertise:</span>
        <ul className="text-gray-300 text-base mt-2 list-disc list-inside">
          <li>AI-powered real estate platforms</li>
          <li>Luxury property marketing & branding</li>
          <li>Market insights & analytics</li>
          <li>Software engineering & product design</li>
          <li>Client engagement & personalized solutions</li>
        </ul>
      </div>
      <div className="mb-8">
        <span className="font-bold text-white">Vision:</span>
        <p className="text-gray-300 mt-2">
          My vision is to make real estate transactions easy, personalized, and hassle-free for every client. By leveraging AI and modern technology, I aim to deliver seamless, transparent, and insightful experiences that empower buyers, sellers, and investors to make confident decisions.
        </p>
      </div>
      <div className="mb-8">
        <span className="font-bold text-white">LinkedIn & Contact:</span>
        <div className="flex flex-col items-center gap-2 mt-2">
          <a href="https://www.linkedin.com/in/karan-poptani-282a78118" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-cyan-400 hover:text-blue-400 text-lg font-medium">
            <Linkedin size={24} />
            LinkedIn: karan-poptani-282a78118
          </a>
          <span className="text-gray-400">Phone: <span className="text-white">+91 7028923314</span></span>
          <span className="text-gray-400">Email: <span className="text-white">karanap86@gmail.com</span></span>
        </div>
      </div>
      <div className="mb-8">
        {/* Market Insights & Thought Leadership section intentionally removed as per strategy. */}
      </div>
      <p className="text-sm text-gray-500">All rights reserved &copy; {new Date().getFullYear()} Karan Ashutosh Poptani</p>
    </section>
  )
}
