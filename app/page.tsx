"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, User, Plus, Edit2, Trash2, Settings, LogOut, ArrowLeft, MessageCircle, BookOpen, Calendar, Upload, Globe } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import Link from "next/link"
import { useAuth } from "@/components/auth-context"
import { useRouter } from "next/navigation"

interface Book {
  id: string
  title: string
  author: string
  spineText: string
  spineColor: string
  spineTexture: "cloth" | "leather" | "paper"
  status: "read" | "reading" | "want-to-read"
  rating?: number // 0-100 scale
  shelfId: string
  isbn?: string
  coverImage?: string
  lastEdited: string
  googleBooksData?: GoogleBookData
}

interface GoogleBookData {
  title: string
  authors: string[]
  description: string
  publishedDate: string
  pageCount: number
  categories: string[]
  imageLinks?: {
    thumbnail: string
    small: string
    medium: string
    large: string
  }
  averageRating?: number
  ratingsCount?: number
  language: string
  publisher: string
}

interface Review {
  id: string
  bookId: string
  userName: string
  userAvatar: string
  rating: number
  comment: string
  date: string
}

interface Bookshelf {
  id: string
  name: string
  color: string
}

const spineColors = ["#8B4513", "#A0522D", "#CD853F", "#D2691E", "#556B2F", "#6B8E23", "#2F4F4F", "#8B7355"]

const spineTextures = ["cloth", "leather", "paper"] as const

const generateSpineColor = () => spineColors[Math.floor(Math.random() * spineColors.length)]
const generateSpineTexture = () => spineTextures[Math.floor(Math.random() * spineTextures.length)]

const generateSpineText = (title: string) => {
  const words = title.split(" ")
  if (words.length === 1) return words[0].substring(0, 12).toUpperCase()
  if (words.length === 2)
    return words
      .map((w) => w.substring(0, 6))
      .join(" ")
      .toUpperCase()
  return words
    .map((w) => w.charAt(0))
    .join("")
    .substring(0, 8)
    .toUpperCase()
}

const getRatingLabel = (rating: number) => {
  if (rating < 20) return "Trash"
  if (rating < 40) return "Meh"
  if (rating < 60) return "Good"
  if (rating < 80) return "Great"
  return "Loved"
}

const defaultShelves: Bookshelf[] = [
  { id: "1", name: "My Library", color: "#8B4513" },
  { id: "2", name: "Favorites", color: "#556B2F" },
  { id: "3", name: "To Read", color: "#2F4F4F" },
]

const sampleBooks: Book[] = [
  {
    id: "1",
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    spineText: "THE GREAT GATSBY",
    spineColor: "#8B4513",
    spineTexture: "cloth",
    status: "read",
    rating: 85,
    shelfId: "1",
    isbn: "9780743273565",
    lastEdited: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    title: "hi",
    author: "sanshray",
    spineText: "HI",
    spineColor: "#A0522D",
    spineTexture: "paper",
    status: "reading",
    shelfId: "1",
    lastEdited: "2024-01-16T14:20:00Z",
  },
  {
    id: "3",
    title: "Dune",
    author: "Frank Herbert",
    spineText: "DUNE",
    spineColor: "#2F4F4F",
    spineTexture: "leather",
    status: "read",
    rating: 95,
    shelfId: "2",
    lastEdited: "2024-01-10T09:15:00Z",
  },
]

const sampleReviews: Review[] = [
  {
    id: "1",
    bookId: "1",
    userName: "BookWorm92",
    userAvatar: "",
    rating: 85,
    comment: "A timeless classic that captures the essence of the American Dream. Fitzgerald's prose is absolutely beautiful.",
    date: "2024-01-15",
  },
]

// Mock Google Books API function
const fetchGoogleBooksData = async (isbn: string): Promise<GoogleBookData | null> => {
  await new Promise((resolve) => setTimeout(resolve, 1000))
  const mockData: { [key: string]: GoogleBookData } = {
    "9780743273565": {
      title: "The Great Gatsby",
      authors: ["F. Scott Fitzgerald"],
      description:
        "Set in the summer of 1922, The Great Gatsby follows narrator Nick Carraway's friendship with the enigmatic Jay Gatsby. Gatsby is known for throwing lavish parties at his West Egg mansion, hoping to attract his lost love, Daisy Buchanan. The novel explores themes of decadence, idealism, resistance to change, social upheaval, and excess.",
      publishedDate: "2004-09-30",
      pageCount: 180,
      categories: ["Fiction", "Classics"],
      imageLinks: {
        thumbnail: "/placeholder.svg?height=200&width=128&text=Gatsby",
        small: "/placeholder.svg?height=300&width=192&text=Gatsby",
        medium: "/placeholder.svg?height=400&width=256&text=Gatsby",
        large: "/placeholder.svg?height=500&width=320&text=Gatsby",
      },
      averageRating: 4.0,
      ratingsCount: 2847,
      language: "en",
      publisher: "Scribner",
    },
  }
  return mockData[isbn] || null
}

export default function HomePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>(sampleBooks)
  const [bookshelves, setBookshelves] = useState<Bookshelf[]>(defaultShelves)
  const [activeShelf, setActiveShelf] = useState("1")
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddShelfModalOpen, setIsAddShelfModalOpen] = useState(false)
  const [editingShelf, setEditingShelf] = useState<string | null>(null)
  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const [loadingBookData, setLoadingBookData] = useState(false)
  const [reviews, setReviews] = useState<Review[]>(sampleReviews)
  const [timezone, setTimezone] = useState("Asia/Calcutta")
  const [newReview, setNewReview] = useState({ rating: 50, comment: "" })
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    coverImage: "",
  })
  const [newShelfName, setNewShelfName] = useState("")
  const [editShelfName, setEditShelfName] = useState("")

  // Auto-update currently reading book
  useEffect(() => {
    const sortedBooks = [...books].sort((a, b) => new Date(b.lastEdited).getTime() - new Date(a.lastEdited).getTime())
    const mostRecentBook = sortedBooks[0]
    
    if (mostRecentBook && mostRecentBook.status !== "reading") {
      setBooks(prevBooks => 
        prevBooks.map(book => ({
          ...book,
          status: book.id === mostRecentBook.id ? "reading" : book.status === "reading" ? "read" : book.status
        }))
      )
    }
  }, [books])

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour12: true,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: timezone,
  })

  const activeShelfBooks = books.filter((book) => book.shelfId === activeShelf)
  const currentShelf = bookshelves.find((shelf) => shelf.id === activeShelf)
  const bookReviews = reviews.filter((review) => review.bookId === selectedBook?.id)
  const currentlyReading = books.find((book) => book.status === "reading")

  useEffect(() => {
    if (selectedBook?.isbn && !selectedBook.googleBooksData) {
      setLoadingBookData(true)
      fetchGoogleBooksData(selectedBook.isbn).then((data) => {
        if (data) {
          setBooks((prevBooks) =>
            prevBooks.map((book) => (book.id === selectedBook.id ? { ...book, googleBooksData: data } : book)),
          )
        }
        setLoadingBookData(false)
      })
    }
  }, [selectedBook])

  const handleAddBook = () => {
    if (newBook.title && newBook.author) {
      const book: Book = {
        id: Date.now().toString(),
        title: newBook.title,
        author: newBook.author,
        spineText: generateSpineText(newBook.title),
        spineColor: generateSpineColor(),
        spineTexture: generateSpineTexture(),
        status: "want-to-read",
        shelfId: activeShelf,
        isbn: newBook.isbn,
        coverImage: newBook.coverImage,
        lastEdited: new Date().toISOString(),
      }
      setBooks([...books, book])
      setNewBook({ title: "", author: "", isbn: "", coverImage: "" })
      setIsAddModalOpen(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewBook({ ...newBook, coverImage: e.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAddShelf = () => {
    if (newShelfName.trim()) {
      const newShelf: Bookshelf = {
        id: Date.now().toString(),
        name: newShelfName.trim(),
        color: generateSpineColor(),
      }
      setBookshelves([...bookshelves, newShelf])
      setNewShelfName("")
      setIsAddShelfModalOpen(false)
    }
  }

  const handleEditShelf = (shelfId: string) => {
    if (editShelfName.trim()) {
      setBookshelves(
        bookshelves.map((shelf) => (shelf.id === shelfId ? { ...shelf, name: editShelfName.trim() } : shelf)),
      )
      setEditingShelf(null)
      setEditShelfName("")
    }
  }

  const handleDeleteShelf = (shelfId: string) => {
    if (bookshelves.length > 1) {
      setBookshelves(bookshelves.filter((shelf) => shelf.id !== shelfId))
      setBooks(books.filter((book) => book.shelfId !== shelfId))
      if (activeShelf === shelfId) {
        setActiveShelf(bookshelves.find((shelf) => shelf.id !== shelfId)?.id || "1")
      }
    }
  }

  const handleBookClick = (book: Book) => {
    // Update last edited time
    setBooks(prevBooks => 
      prevBooks.map(b => 
        b.id === book.id 
          ? { ...b, lastEdited: new Date().toISOString() }
          : b
      )
    )
    setSelectedBook(book)
  }

  const handleCloseBookDetail = () => {
    setSelectedBook(null)
  }

  const handleAddReview = () => {
    if (newReview.comment.trim() && selectedBook) {
      const review: Review = {
        id: Date.now().toString(),
        bookId: selectedBook.id,
        userName: "You",
        userAvatar: "",
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        date: new Date().toISOString().split("T")[0],
      }
      setReviews([...reviews, review])
      setNewReview({ rating: 50, comment: "" })
    }
  }

  const getSpineTextureStyle = (texture: "cloth" | "leather" | "paper") => {
    switch (texture) {
      case "cloth":
        return {
          backgroundImage: `
            repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px),
            repeating-linear-gradient(-45deg, transparent, transparent 1px, rgba(255,255,255,0.05) 1px, rgba(255,255,255,0.05) 2px)
          `,
        }
      case "leather":
        return {
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(0,0,0,0.1) 1px, transparent 1px),
            radial-gradient(circle at 80% 20%, rgba(0,0,0,0.1) 1px, transparent 1px),
            radial-gradient(circle at 40% 80%, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "8px 8px, 12px 12px, 6px 6px",
        }
      case "paper":
        return {
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 3px)
          `,
        }
    }
  }

  const BookSpine = ({ book, index }: { book: Book; index: number }) => {
  // Generate consistent random height for each book based on its ID
  const getBookHeight = (bookId: string) => {
    const hash = bookId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    // Base height 320px (h-80) with ±16px variation
    return 320 + (Math.abs(hash) % 32) - 16
  }

  const bookHeight = getBookHeight(book.id)

  return (
    <div
      className="relative cursor-pointer"
      onClick={() => handleBookClick(book)}
    >
      <div
        className="w-11 rounded-sm shadow-lg flex items-center justify-center relative overflow-hidden border-r border-black/10"
        style={{
          height: `${bookHeight}px`,
          backgroundColor: book.spineColor,
          ...getSpineTextureStyle(book.spineTexture),
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/10" />
        
        <div className="transform -rotate-90 text-white font-serif text-xs tracking-wide whitespace-nowrap px-2 drop-shadow-sm font-medium">
          {book.spineText}
        </div>
        
        <div className="absolute bottom-3 right-1 w-0.5 h-6 bg-white/20 rounded-full" />
        <div className="absolute top-3 right-1 w-0.5 h-6 bg-white/20 rounded-full" />
      </div>
    </div>
  )
}

  if (selectedBook) {
    return (
      <div className="min-h-screen bg-[#ede7d9] text-[#333333] font-sans flex">
        <div className="flex-1 flex">
          {/* Left side - Book Cover */}
          <div className="w-1/3 p-8 flex items-center justify-center bg-gradient-to-br from-[#c9b79c] to-[#ede7d9]">
            <div className="text-center">
              <div className="mb-6">
                <img
                  src={
                    selectedBook.coverImage ||
                    selectedBook.googleBooksData?.imageLinks?.large ||
                    "/placeholder.svg?height=500&width=320&text=Book+Cover"
                   || "/placeholder.svg"}
                  alt={selectedBook.title}
                  className="w-80 h-auto rounded-lg shadow-xl mx-auto"
                  style={{ filter: "sepia(10%) saturate(90%)" }}
                />
              </div>
              <Button
                onClick={handleCloseBookDetail}
                variant="outline"
                className="border-[#5a4638] hover:bg-[#5a4638] hover:text-[#ede7d9] text-[#5a4638] bg-transparent shadow-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Shelf
              </Button>
            </div>
          </div>

          {/* Right side - Book Details and Reviews */}
          <div className="w-2/3 p-8 overflow-y-auto">
            <div className="space-y-6">
              {/* Book Info */}
              <div>
                <h1 className="text-4xl font-serif font-bold mb-2 text-[#5a4638]">{selectedBook.title}</h1>
                <p className="text-xl text-[#5a4638]/80 mb-4 font-serif italic">by {selectedBook.author}</p>

                {loadingBookData ? (
                  <div className="animate-pulse">
                    <div className="h-4 bg-[#c9b79c] rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-[#c9b79c] rounded w-1/2"></div>
                  </div>
                ) : selectedBook.googleBooksData ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-[#5a4638]/70">
                      {selectedBook.googleBooksData.averageRating && (
                        <div className="flex items-center gap-1">
                          <span>{selectedBook.googleBooksData.averageRating}/5</span>
                          <span>({selectedBook.googleBooksData.ratingsCount} ratings)</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        <span>{selectedBook.googleBooksData.pageCount} pages</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{selectedBook.googleBooksData.publishedDate}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-serif font-semibold mb-2 text-[#5a4638]">Description</h3>
                      <p className="text-[#5a4638]/90 leading-relaxed">{selectedBook.googleBooksData.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-[#5a4638]/70">Publisher:</span>
                        <span className="ml-2 text-[#5a4638]">{selectedBook.googleBooksData.publisher}</span>
                      </div>
                      <div>
                        <span className="text-[#5a4638]/70">Language:</span>
                        <span className="ml-2 text-[#5a4638]">{selectedBook.googleBooksData.language.toUpperCase()}</span>
                      </div>
                    </div>

                    {selectedBook.googleBooksData.categories && (
                      <div>
                        <span className="text-[#5a4638]/70 text-sm">Genres:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {selectedBook.googleBooksData.categories.map((category) => (
                            <span key={category} className="px-2 py-1 bg-[#5a4638] text-[#ede7d9] rounded text-xs">
                              {category}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>

              {/* Reviews Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <MessageCircle className="w-5 h-5 text-[#5a4638]" />
                  <h3 className="text-xl font-serif font-semibold text-[#5a4638]">Reviews & Comments</h3>
                  <span className="text-[#5a4638]/70">({bookReviews.length})</span>
                </div>

                {/* Add Review */}
                <div className="bg-white/50 rounded-lg p-4 mb-6 shadow-sm border border-[#c9b79c]/30">
                  <h4 className="font-semibold mb-3 text-[#5a4638]">Add Your Review</h4>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-[#5a4638]">Rating: {getRatingLabel(newReview.rating)}</Label>
                      <div className="mt-2">
                        <Slider
                          value={[newReview.rating]}
                          onValueChange={(value) => setNewReview({ ...newReview, rating: value[0] })}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-[#5a4638]/70 mt-1">
                          <span>Trash</span>
                          <span>Loved</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Textarea
                        placeholder="Share your thoughts about this book..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="bg-white/70 border-[#c9b79c] text-[#333333] placeholder:text-[#5a4638]/50"
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleAddReview} className="bg-[#5a4638] hover:bg-[#5a4638]/90 text-[#ede7d9]">
                      Post Review
                    </Button>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {bookReviews.map((review) => (
                    <div key={review.id} className="bg-white/50 rounded-lg p-4 shadow-sm border border-[#c9b79c]/30">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-[#5a4638] text-[#ede7d9] text-sm">
                            {review.userName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm text-[#5a4638]">{review.userName}</span>
                            <span className="text-sm text-[#5a4638]/70">{getRatingLabel(review.rating)}</span>
                            <span className="text-xs text-[#5a4638]/50">{review.date}</span>
                          </div>
                          <p className="text-[#5a4638]/90 text-sm">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ede7d9] text-[#333333] font-sans flex">

      
      {/* Collapsible Sidebar */}
      <motion.div
        className="relative bg-[#c9b79c] border-r border-[#5a4638]/20 flex flex-col z-10 shadow-lg"
        initial={{ width: 60 }}
        animate={{ width: isSidebarHovered ? 256 : 60 }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
      >
        <div className="p-4 border-b border-[#5a4638]/20">
          <AnimatePresence>
            {isSidebarHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <h2 className="font-serif font-bold text-lg mb-4 text-[#5a4638]">Bookshelves</h2>
                <Dialog open={isAddShelfModalOpen} onOpenChange={setIsAddShelfModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-[#5a4638]/30 hover:bg-[#5a4638] hover:text-[#ede7d9] text-[#5a4638] bg-transparent shadow-sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Shelf
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#ede7d9] border-[#5a4638]/20 text-[#333333]">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-[#5a4638]">Add New Bookshelf</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="shelfName" className="text-[#5a4638]">Shelf Name</Label>
                        <Input
                          id="shelfName"
                          value={newShelfName}
                          onChange={(e) => setNewShelfName(e.target.value)}
                          className="bg-white/70 border-[#c9b79c] text-[#333333]"
                          placeholder="Enter shelf name"
                        />
                      </div>
                      <Button onClick={handleAddShelf} className="w-full bg-[#5a4638] hover:bg-[#5a4638]/90 text-[#ede7d9]">
                        Create Shelf
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto">
          {bookshelves.map((shelf) => (
            <div
              key={shelf.id}
              className={`group flex items-center justify-between p-3 cursor-pointer hover:bg-[#5a4638]/10 transition-colors ${
                activeShelf === shelf.id ? "bg-[#5a4638]/20 border-r-2 border-[#5a4638]" : ""
              }`}
            >
              {editingShelf === shelf.id && isSidebarHovered ? (
                <div className="flex-1 flex gap-2">
                  <Input
                    value={editShelfName}
                    onChange={(e) => setEditShelfName(e.target.value)}
                    className="bg-white/70 border-[#c9b79c] text-[#333333] text-sm h-8"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditShelf(shelf.id)
                      if (e.key === "Escape") {
                        setEditingShelf(null)
                        setEditShelfName("")
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => handleEditShelf(shelf.id)}
                    className="h-8 px-2 bg-[#5a4638] hover:bg-[#5a4638]/90 text-[#ede7d9]"
                  >
                    ✓
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex-1 flex items-center gap-3" onClick={() => setActiveShelf(shelf.id)}>
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: shelf.color }} />
                    <AnimatePresence>
                      {isSidebarHovered && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex items-center gap-2 overflow-hidden"
                        >
                          <span className="text-sm whitespace-nowrap text-[#5a4638]">{shelf.name}</span>
                          <span className="text-xs text-[#5a4638]/70 whitespace-nowrap">
                            ({books.filter((b) => b.shelfId === shelf.id).length})
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  <AnimatePresence>
                    {isSidebarHovered && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.3 }}
                        className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity"
                      >
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingShelf(shelf.id)
                            setEditShelfName(shelf.name)
                          }}
                          className="h-6 w-6 p-0 hover:bg-[#5a4638]/20 text-[#5a4638]"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        {bookshelves.length > 1 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteShelf(shelf.id)
                            }}
                            className="h-6 w-6 p-0 hover:bg-red-600/20 text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[#5a4638]/20 space-y-2">
          <AnimatePresence>
            {isSidebarHovered && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                {user ? (
                  <Link href="/profile">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[#5a4638] hover:text-[#ede7d9] hover:bg-[#5a4638]"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                ) : (
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[#5a4638] hover:text-[#ede7d9] hover:bg-[#5a4638]"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                )}
                {user && (
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-[#5a4638] hover:text-[#ede7d9] hover:bg-[#5a4638]"
                    onClick={async () => {
                      await signOut()
                      router.push('/login')
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="flex items-center justify-between p-6 border-b border-[#5a4638]/20 bg-white/30">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#5a4638]">{currentShelf?.name || "My Bookshelf"}</h1>
            <p className="text-[#5a4638]/70 text-sm">{activeShelfBooks.length} books</p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="border-[#5a4638]/30 hover:bg-[#5a4638] hover:text-[#ede7d9] text-[#5a4638] bg-transparent shadow-sm"
              >
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#ede7d9] border-[#5a4638]/20 text-[#333333]">
              <DialogHeader>
                <DialogTitle className="font-serif text-[#5a4638]">Add a new book</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="text-[#5a4638]">Title</Label>
                  <Input
                    id="title"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    className="bg-white/70 border-[#c9b79c] text-[#333333]"
                  />
                </div>
                <div>
                  <Label htmlFor="author" className="text-[#5a4638]">Author</Label>
                  <Input
                    id="author"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    className="bg-white/70 border-[#c9b79c] text-[#333333]"
                  />
                </div>
                <div>
                  <Label htmlFor="isbn" className="text-[#5a4638]">ISBN (optional)</Label>
                  <Input
                    id="isbn"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    className="bg-white/70 border-[#c9b79c] text-[#333333]"
                    placeholder="For automatic book info"
                  />
                </div>
                <div>
                  <Label htmlFor="cover" className="text-[#5a4638]">Book Cover Image</Label>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="cover"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("cover")?.click()}
                      className="w-full border-[#5a4638]/30 hover:bg-[#5a4638]/10 text-[#5a4638] bg-transparent"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Cover Image
                    </Button>
                    {newBook.coverImage && (
                      <div className="mt-2">
                        <img src={newBook.coverImage || "/placeholder.svg"} alt="Preview" className="w-20 h-28 object-cover rounded" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-[#5a4638]/70">
                  <p>✨ Spine color and texture will be auto-generated</p>
                </div>
                <Button onClick={handleAddBook} className="w-full bg-[#5a4638] hover:bg-[#5a4638]/90 text-[#ede7d9]">
                  Add to {currentShelf?.name}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        {/* Bookshelf with Wood Texture */}
        <main className="flex-1 p-6 relative">
          <div
            className="min-h-[70vh] flex items-end justify-center relative"
            style={{
              backgroundImage: `
                linear-gradient(180deg, transparent 0%, rgba(90, 70, 56, 0.05) 85%, rgba(90, 70, 56, 0.1) 100%),
                repeating-linear-gradient(
                  90deg,
                  rgba(139, 69, 19, 0.03) 0px,
                  rgba(160, 82, 45, 0.03) 2px,
                  rgba(139, 69, 19, 0.03) 4px
                )
              `,
            }}
          >
            {/* Wood shelf */}
            <div
              className="absolute bottom-0 left-0 right-0 h-6 shadow-lg"
              style={{
                background: `
                  linear-gradient(180deg, #8B4513 0%, #A0522D 50%, #8B4513 100%),
                  repeating-linear-gradient(
                    90deg,
                    #8B4513 0px,
                    #A0522D 1px,
                    #8B4513 2px
                  )
                `,
                backgroundBlendMode: "multiply",
              }}
            />

            {activeShelfBooks.length > 0 ? (
              <div className="flex gap-0.5 items-end pb-6" style={{ minHeight: '340px' }}>
                {activeShelfBooks.map((book, index) => (
                  <BookSpine key={`${book.id}-${activeShelf}`} book={book} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center text-[#5a4638]/70 pb-16">
                <p className="text-lg mb-2 font-serif">This shelf is empty</p>
                <p className="text-sm">Add your first book to get started!</p>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="flex items-center justify-between px-6 py-3 border-t border-[#5a4638]/20 text-xs text-[#5a4638]/70 bg-white/20">
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span>Book Lover</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>{currentTime}</span>
            </div>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="w-32 h-6 bg-transparent border-[#5a4638]/30 text-[#5a4638]/70 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#ede7d9] border-[#5a4638]/20">
                <SelectItem value="Asia/Calcutta">Asia/Calcutta</SelectItem>
                <SelectItem value="America/New_York">America/New_York</SelectItem>
                <SelectItem value="Europe/London">Europe/London</SelectItem>
                <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                <SelectItem value="Australia/Sydney">Australia/Sydney</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-xs">
            <span>Currently reading: </span>
            <span className="text-[#5a4638] font-medium">{currentlyReading?.title || "None"}</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
