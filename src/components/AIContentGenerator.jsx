import React from 'react'
import { Sparkles, Zap, Copy, Download } from 'lucide-react'

export default function AIContentGenerator() {
  const [selectedProject, setSelectedProject] = React.useState(null)
  const [contentType, setContentType] = React.useState('description')
  const [generatedContent, setGeneratedContent] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  // Mock AI generation - in production, this would call your backend/OpenAI API
  const generateContent = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const mockContent = {
      description: `Discover luxury living at its finest in this exquisite property. Located in a prime location with world-class amenities, this residence offers the perfect blend of comfort and sophistication. Features premium finishes, modern architecture, and breathtaking views. Perfect for discerning investors and homeowners seeking the ultimate lifestyle experience.`,
      marketing: `🏢 Exclusive Opportunity! This premium property is a game-changer in the Dubai real estate market. With exceptional ROI potential and strong appreciation forecasts, it's a smart investment. Limited units available - act fast! 🚀 #DubaiRealestate #InvestmentOpportunity`,
      socialMedia: `✨ Your Dream Property Awaits ✨
Stunning architecture • World-class amenities
Strong ROI potential • Growing appreciation
Location: Prime area with high demand
Join thousands of satisfied investors 🌟
Schedule your viewing today!`,
      creative: `🎨 Marketing Copy:
"Elevate Your Lifestyle"
Experience luxury beyond expectations. Our properties aren't just investments—they're a lifestyle statement. Premium locations, premium returns. Your future starts here.`,
      emailCampaign: `Subject: Your Exclusive Property Opportunity Awaits 📍

Dear Valued Client,

We're excited to present an exceptional investment opportunity that aligns perfectly with your portfolio goals. This premium property offers:

✓ Strong ROI & Appreciation Potential
✓ Prime Location & Premium Amenities  
✓ Limited Availability - Act Now
✓ Flexible Payment Plans

Schedule your exclusive viewing this week.

Best Regards,
Dubai Properties Team`
    }

    setGeneratedContent(mockContent[contentType] || '')
    setLoading(false)
  }

  const contentTypes = [
    { id: 'description', label: 'Property Description' },
    { id: 'marketing', label: 'Marketing Copy' },
    { id: 'socialMedia', label: 'Social Media Post' },
    { id: 'creative', label: 'Creative Headline' },
    { id: 'emailCampaign', label: 'Email Campaign' }
  ]

  return (
    <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles size={32} className="text-cyan-400" />
            AI Content Generator
          </h1>
          <p className="text-gray-400">Generate marketing content and creatives for your properties</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 sticky top-24">
              <h3 className="font-semibold text-white mb-4">Generation Settings</h3>

              {/* Content Type Selection */}
              <div className="mb-6">
                <label className="block text-xs text-gray-400 font-semibold mb-3 uppercase">Content Type</label>
                <div className="space-y-2">
                  {contentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setContentType(type.id)
                        setGeneratedContent('')
                      }}
                      className={`w-full px-4 py-2 rounded-lg text-left text-sm transition-all ${
                        contentType === type.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone Selection */}
              <div className="mb-6">
                <label className="block text-xs text-gray-400 font-semibold mb-3 uppercase">Tone</label>
                <div className="space-y-2">
                  {['Professional', 'Casual', 'Luxury', 'Family-Friendly'].map((tone) => (
                    <button
                      key={tone}
                      className="w-full px-4 py-2 rounded-lg text-left text-sm bg-slate-700 text-gray-300 hover:bg-slate-600 transition-all"
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateContent}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Zap size={18} />
                {loading ? 'Generating...' : 'Generate Content'}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-white">Generated Content</h3>
                {generatedContent && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedContent)}
                      className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                      title="Copy to clipboard"
                    >
                      <Copy size={18} />
                    </button>
                    <button
                      onClick={() => {
                        const element = document.createElement('a')
                        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(generatedContent))
                        element.setAttribute('download', `content-${contentType}.txt`)
                        element.style.display = 'none'
                        document.body.appendChild(element)
                        element.click()
                        document.body.removeChild(element)
                      }}
                      className="p-2 text-gray-400 hover:text-cyan-400 transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="min-h-64 bg-gray-900 rounded-lg p-4 border border-slate-700">
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin mb-4">
                        <Sparkles size={32} className="text-cyan-400" />
                      </div>
                      <p className="text-gray-400">Generating your content...</p>
                    </div>
                  </div>
                ) : generatedContent ? (
                  <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{generatedContent}</p>
                ) : (
                  <p className="text-gray-500 flex items-center justify-center h-64">
                    Select content type and click "Generate Content" to get started
                  </p>
                )}
              </div>

              {/* Usage Tips */}
              {generatedContent && (
                <div className="mt-4 p-4 bg-blue-600/20 border border-blue-600/50 rounded-lg">
                  <h4 className="text-sm font-semibold text-cyan-400 mb-2">💡 Pro Tips:</h4>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• Copy and paste this content to your social media, emails, or website</li>
                    <li>• Customize the tone and details based on your target audience</li>
                    <li>• Use different content types for different marketing channels</li>
                    <li>• Always verify facts and ROI claims before publishing</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Preview Examples */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">📱 Social Media Template</h3>
            <div className="bg-gray-900 rounded-lg p-4 text-gray-300 text-sm space-y-2">
              <p>🏢 Featured Property ✨</p>
              <p>Location: Premium Dubai Address</p>
              <p>ROI: 8-15% | Appreciation: 10-15%/year</p>
              <p>🔗 Link in bio to view full details</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">📧 Email Template</h3>
            <div className="bg-gray-900 rounded-lg p-4 text-gray-300 text-sm space-y-2">
              <p>Subject: Exclusive Property Match</p>
              <p>Hi [Name], we found a property that matches your criteria...</p>
              <p>[Details] [CTA Button]</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
