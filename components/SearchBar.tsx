"use client";

import { useState, useEffect, useRef } from "react";
import { SearchIcon, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useOnClickOutside } from "@/lib/hooks";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  imageUrl: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Detect clicks outside of search results to close dropdown
  useOnClickOutside(searchRef, () => setShowResults(false));

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        
        if (response.ok) {
          const data = await response.json();
          setResults(data.users);
          setShowResults(true);
        } else {
          console.error("Error searching users:", response.statusText);
          setResults([]);
        }
      } catch (error) {
        console.error("Error searching users:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search requests
    const timerId = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timerId);
  }, [query]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/users?search=${encodeURIComponent(query)}`);
      setShowResults(false);
    }
  };

  return (
    <div className="relative flex-1" ref={searchRef}>
      <form 
        onSubmit={handleSubmit}
        className="flex items-center space-x-2 bg-accent p-2.5 rounded-full flex-1 mx-3 max-w-96 border border-border"
      >
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search people..."
          className="bg-transparent flex-1 outline-none text-sm"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 2 && setShowResults(true)}
        />
        {query && (
          <button 
            type="button"
            onClick={clearSearch}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute left-3 right-3 top-full mt-1 max-h-80 overflow-y-auto bg-background border rounded-md shadow-lg z-50">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">Loading...</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((user) => (
                <li key={user.id} className="border-b last:border-0">
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setShowResults(false)}
                    className="flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.imageUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      {user.username && (
                        <p className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="p-4 text-center text-muted-foreground">
              No users found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}