import React, { useState, useEffect } from 'react';
import { Search, BookOpen, User, Calendar, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Book {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  subject?: string[];
  publisher?: string[];
  language?: string[];
  edition_count?: number;
}

interface SearchResponse {
  docs: Book[];
  numFound: number;
}

const BookFinder = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'title' | 'author' | 'subject'>('title');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const getCoverUrl = (coverId: number, size: 'S' | 'M' | 'L' = 'M') => {
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  };

  const searchBooks = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Please enter a search term",
        description: "Enter a book title, author, or subject to search.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setHasSearched(true);
    
    try {
      const searchParam = searchType === 'title' ? 'title' : 
                         searchType === 'author' ? 'author' : 'subject';
      
      const response = await fetch(
        `https://openlibrary.org/search.json?${searchParam}=${encodeURIComponent(searchQuery)}&limit=20`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }
      
      const data: SearchResponse = await response.json();
      setBooks(data.docs);
      
      if (data.docs.length === 0) {
        toast({
          title: "No books found",
          description: `Try searching with different ${searchType} terms.`,
        });
      } else {
        toast({
          title: "Search successful!",
          description: `Found ${data.numFound} books matching your search.`,
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "There was an error searching for books. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchBooks();
    }
  };

  const getBookUrl = (book: Book) => {
    return `https://openlibrary.org${book.key}`;
  };

  return (
    <div className="min-h-screen bg-gradient-academic p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">
            📚 Book Finder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover your next great read. Search through millions of books by title, author, or subject.
          </p>
        </div>

        {/* Search Interface */}
        <Card className="mb-8 shadow-elegant border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Search className="h-5 w-5" />
              Search Books
            </CardTitle>
            <CardDescription>
              Find books across the Open Library collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={`Search by ${searchType}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="search-input h-12 text-lg"
                />
              </div>
              <div className="flex gap-2">
                {(['title', 'author', 'subject'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={searchType === type ? 'default' : 'outline'}
                    onClick={() => setSearchType(type)}
                    className="capitalize"
                  >
                    {type === 'title' && <BookOpen className="h-4 w-4 mr-1" />}
                    {type === 'author' && <User className="h-4 w-4 mr-1" />}
                    {type === 'subject' && <Calendar className="h-4 w-4 mr-1" />}
                    {type}
                  </Button>
                ))}
              </div>
              <Button 
                onClick={searchBooks} 
                disabled={loading}
                variant="hero"
                className="h-12 px-8"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Card key={index} className="book-card">
                <CardContent className="p-4">
                  <Skeleton className="h-48 w-full mb-4 rounded" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results */}
        {!loading && hasSearched && books.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Card key={book.key} className="book-card hover:shadow-book transition-all duration-300 border-0 bg-card/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="aspect-[3/4] mb-4 relative overflow-hidden rounded-lg bg-muted flex items-center justify-center">
                    {book.cover_i ? (
                      <img
                        src={getCoverUrl(book.cover_i, 'M')}
                        alt={`Cover of ${book.title}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`${book.cover_i ? 'hidden' : ''} text-muted-foreground text-center p-4`}>
                      <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No cover available</p>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2 leading-tight">
                    {book.title}
                  </h3>
                  
                  {book.author_name && book.author_name.length > 0 && (
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {book.author_name[0]}
                      {book.author_name.length > 1 && ` +${book.author_name.length - 1} more`}
                    </p>
                  )}
                  
                  {book.first_publish_year && (
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {book.first_publish_year}
                    </p>
                  )}
                  
                  {book.subject && book.subject.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {book.subject.slice(0, 3).map((subject, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {book.subject.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{book.subject.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="p-4 pt-0">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    asChild
                  >
                    <a 
                      href={getBookUrl(book)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      View Details
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && hasSearched && books.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-foreground mb-2">No books found</h2>
            <p className="text-muted-foreground">
              Try adjusting your search terms or search type.
            </p>
          </div>
        )}

        {/* Welcome State */}
        {!hasSearched && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📖</div>
            <h2 className="text-3xl font-semibold text-primary mb-4">
              Welcome to Book Finder
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Start your literary journey by searching for books by title, author, or subject. 
              Discover new favorites and rediscover classics from the Open Library collection.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Search by title
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Find by author
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Browse by subject
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookFinder;