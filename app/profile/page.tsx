"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowLeft, Edit2, Save, X, BookOpen, Heart, Target, Calendar, Upload, Download, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface UserProfile {
  name: string
  email: string
  joinDate: string
  avatar: string
  bio: string
}

const mockProfile: UserProfile = {
  name: "Book Lover",
  email: "booklover@example.com",
  joinDate: "January 2024",
  avatar: "",
  bio: "Passionate reader exploring worlds through books 📚",
}

const mockStats = {
  totalBooks: 47,
  booksRead: 32,
  currentlyReading: 3,
  wantToRead: 12,
  favoriteGenres: ["Fiction", "Sci-Fi", "Mystery"],
  readingGoal: 50,
  averageRating: 4.2,
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile)
  const [goodreadsData, setGoodreadsData] = useState<any>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [importedBooks, setImportedBooks] = useState(0)

  const handleSave = () => {
    setProfile(editedProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const handleGoodreadsFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const csvData = e.target?.result as string
        parseGoodreadsCSV(csvData)
      }
      reader.readAsText(file)
    }
  }

  const parseGoodreadsCSV = (csvData: string) => {
    setIsImporting(true)
    setImportStatus('idle')
    
    // Simulate parsing and importing process
    setTimeout(() => {
      try {
        const lines = csvData.split('\n')
        const headers = lines[0].split(',')
        const books = []
        
        // Mock parsing - in real implementation, you'd parse the actual CSV
        for (let i = 1; i < Math.min(lines.length, 20); i++) {
          if (lines[i].trim()) {
            books.push({
              title: `Book ${i}`,
              author: `Author ${i}`,
              rating: Math.floor(Math.random() * 5) + 1,
              dateRead: '2024-01-01'
            })
          }
        }
        
        setGoodreadsData(books)
        setImportedBooks(books.length)
        setImportStatus('success')
        setIsImporting(false)
      } catch (error) {
        setImportStatus('error')
        setIsImporting(false)
      }
    }, 2000)
  }

  const handleConnectGoodreads = () => {
    // Mock OAuth connection - in real implementation, this would redirect to Goodreads OAuth
    setIsImporting(true)
    setTimeout(() => {
      setImportStatus('success')
      setImportedBooks(47)
      setIsImporting(false)
    }, 3000)
  }

  const progressPercentage = (mockStats.booksRead / mockStats.readingGoal) * 100

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </Link>
          <h1 className="text-2xl font-['Playfair_Display'] font-bold">Profile</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Profile Header */}
        <Card className="bg-[#262626] border-gray-700">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-[#ffa94d] text-black text-xl font-bold">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                        className="bg-[#1a1a1a] border-gray-600 text-white"
                      />
                      <Input
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                        className="bg-[#1a1a1a] border-gray-600 text-white"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold">{profile.name}</h2>
                      <p className="text-gray-400">{profile.email}</p>
                      <p className="text-sm text-gray-500">Member since {profile.joinDate}</p>
                      {profile.bio && <p className="text-gray-300 mt-2">{profile.bio}</p>}
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancel}
                      size="sm"
                      variant="outline"
                      className="border-gray-600 bg-transparent"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} size="sm" variant="outline" className="border-gray-600">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#262626] border-gray-700">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-[#ffa94d]" />
              <div className="text-2xl font-bold">{mockStats.totalBooks}</div>
              <div className="text-sm text-gray-400">Total Books</div>
            </CardContent>
          </Card>
          <Card className="bg-[#262626] border-gray-700">
            <CardContent className="p-4 text-center">
              <Heart className="w-8 h-8 mx-auto mb-2 text-[#dc2626]" />
              <div className="text-2xl font-bold">{mockStats.booksRead}</div>
              <div className="text-sm text-gray-400">Books Read</div>
            </CardContent>
          </Card>
          <Card className="bg-[#262626] border-gray-700">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-[#94d82d]" />
              <div className="text-2xl font-bold">{mockStats.currentlyReading}</div>
              <div className="text-sm text-gray-400">Currently Reading</div>
            </CardContent>
          </Card>
          <Card className="bg-[#262626] border-gray-700">
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-[#8b5cf6]" />
              <div className="text-2xl font-bold">{mockStats.wantToRead}</div>
              <div className="text-sm text-gray-400">Want to Read</div>
            </CardContent>
          </Card>
        </div>

        {/* Reading Goal */}
        <Card className="bg-[#262626] border-gray-700">
          <CardHeader>
            <CardTitle className="font-['Playfair_Display']">2024 Reading Goal</CardTitle>
            <CardDescription>
              {mockStats.booksRead} of {mockStats.readingGoal} books read
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{mockStats.booksRead} books</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className="bg-[#ffa94d] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="text-sm text-gray-400">{mockStats.readingGoal - mockStats.booksRead} books to go!</p>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Stats */}
        <Tabs defaultValue="genres" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-[#262626]">
            <TabsTrigger value="genres">Favorite Genres</TabsTrigger>
            <TabsTrigger value="activity">Reading Activity</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="goodreads">Goodreads Import</TabsTrigger>
          </TabsList>

          <TabsContent value="genres" className="space-y-4">
            <Card className="bg-[#262626] border-gray-700">
              <CardHeader>
                <CardTitle>Top Genres</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockStats.favoriteGenres.map((genre, index) => (
                    <span key={genre} className="px-3 py-1 bg-[#ffa94d] text-black rounded-full text-sm font-medium">
                      {genre}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="bg-[#262626] border-gray-700">
              <CardHeader>
                <CardTitle>Reading Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Rating</span>
                    <span className="font-bold">{mockStats.averageRating}/5 ⭐</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Books This Month</span>
                    <span className="font-bold">4 books</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Longest Reading Streak</span>
                    <span className="font-bold">23 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            <Card className="bg-[#262626] border-gray-700">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-[#1a1a1a] rounded-lg">
                    <div className="text-2xl mb-2">🏆</div>
                    <div className="font-semibold">Bookworm</div>
                    <div className="text-sm text-gray-400">Read 25+ books</div>
                  </div>
                  <div className="text-center p-4 bg-[#1a1a1a] rounded-lg">
                    <div className="text-2xl mb-2">📚</div>
                    <div className="font-semibold">Genre Explorer</div>
                    <div className="text-sm text-gray-400">Read 5+ genres</div>
                  </div>
                  <div className="text-center p-4 bg-[#1a1a1a] rounded-lg">
                    <div className="text-2xl mb-2">⭐</div>
                    <div className="font-semibold">Critic</div>
                    <div className="text-sm text-gray-400">Rated 50+ books</div>
                  </div>
                  <div className="text-center p-4 bg-[#1a1a1a] rounded-lg opacity-50">
                    <div className="text-2xl mb-2">🔥</div>
                    <div className="font-semibold">Speed Reader</div>
                    <div className="text-sm text-gray-400">Read 100+ books</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goodreads" className="space-y-4">
            <Card className="bg-[#c9b79c] border-[#5a4638]/20">
              <CardHeader>
                <CardTitle className="font-serif text-[#5a4638] flex items-center gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Import from Goodreads
                </CardTitle>
                <CardDescription className="text-[#5a4638]/70">
                  Connect your Goodreads account or upload your reading data to import your books and ratings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* OAuth Connection Method */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-[#5a4638]">Method 1: Connect Account</h4>
                  <p className="text-sm text-[#5a4638]/70">
                    Connect your Goodreads account to automatically import your reading history, ratings, and reviews.
                  </p>
                  <Button
                    onClick={handleConnectGoodreads}
                    disabled={isImporting}
                    className="bg-[#5a4638] hover:bg-[#5a4638]/90 text-[#ede7d9] w-full sm:w-auto"
                  >
                    {isImporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Connect Goodreads Account
                      </>
                    )}
                  </Button>
                </div>

                <div className="border-t border-[#5a4638]/20 pt-6">
                  {/* CSV Upload Method */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-[#5a4638]">Method 2: Upload CSV File</h4>
                    <p className="text-sm text-[#5a4638]/70">
                      Export your Goodreads library as a CSV file and upload it here. 
                      <a 
                        href="https://www.goodreads.com/review/import" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[#5a4638] underline hover:no-underline ml-1"
                      >
                        Get your CSV export here
                      </a>
                    </p>
                    
                    <div className="border-2 border-dashed border-[#5a4638]/30 rounded-lg p-6 text-center hover:border-[#5a4638]/50 transition-colors">
                      <input
                        type="file"
                        id="goodreads-csv"
                        accept=".csv"
                        onChange={handleGoodreadsFileUpload}
                        className="hidden"
                        disabled={isImporting}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("goodreads-csv")?.click()}
                        disabled={isImporting}
                        className="border-[#5a4638]/30 hover:bg-[#5a4638]/10 text-[#5a4638] bg-transparent"
                      >
                        {isImporting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#5a4638] mr-2"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Goodreads CSV
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-[#5a4638]/50 mt-2">
                        Supports .csv files exported from Goodreads
                      </p>
                    </div>
                  </div>
                </div>

                {/* Import Status */}
                {importStatus !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg border ${
                      importStatus === 'success' 
                        ? 'bg-green-50 border-green-200 text-green-800' 
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {importStatus === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <div>
                        <h4 className="font-semibold">
                          {importStatus === 'success' ? 'Import Successful!' : 'Import Failed'}
                        </h4>
                        <p className="text-sm">
                          {importStatus === 'success' 
                            ? `Successfully imported ${importedBooks} books from your Goodreads library.`
                            : 'There was an error processing your Goodreads data. Please try again.'
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Import Preview */}
                {goodreadsData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <h4 className="font-semibold text-[#5a4638]">Import Preview</h4>
                    <div className="bg-white/50 rounded-lg p-4 max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {goodreadsData.slice(0, 5).map((book: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm border-b border-[#5a4638]/10 pb-2">
                            <div>
                              <span className="font-medium text-[#5a4638]">{book.title}</span>
                              <span className="text-[#5a4638]/70 ml-2">by {book.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-[#5a4638]/50">{book.rating}/5</span>
                            </div>
                          </div>
                        ))}
                        {goodreadsData.length > 5 && (
                          <p className="text-xs text-[#5a4638]/50 text-center pt-2">
                            ...and {goodreadsData.length - 5} more books
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        className="bg-[#5a4638] hover:bg-[#5a4638]/90 text-[#ede7d9]"
                        onClick={() => {
                          // In real implementation, this would merge the data with existing library
                          alert('Books imported successfully!')
                          setGoodreadsData(null)
                        }}
                      >
                        Import All Books
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-[#5a4638]/30 text-[#5a4638]"
                        onClick={() => setGoodreadsData(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Help Section */}
                <div className="bg-[#ede7d9]/50 rounded-lg p-4 border border-[#5a4638]/10">
                  <h4 className="font-semibold text-[#5a4638] mb-2">How to export from Goodreads:</h4>
                  <ol className="text-sm text-[#5a4638]/70 space-y-1 list-decimal list-inside">
                    <li>Go to your Goodreads account settings</li>
                    <li>Click on "Import and Export"</li>
                    <li>Click "Export Library" to download your CSV file</li>
                    <li>Upload the downloaded file here</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
