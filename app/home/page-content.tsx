"use client";
import { ComponentHolder } from "@/components/custom/component-holder";
import { components } from "@/contants";
import { SearchIcon } from "lucide-react";
import React, { useState } from "react";

export default function PageContent() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredComponents = components.filter((component) =>
    component.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="grid grid-flow-row gap-4 p-10">
      <h1 className="text-4xl text-teal-600">Search Component</h1>
      <div
        className={
          "relative flex h-8 w-full items-center rounded-md border p-2 transition focus-within:ring-1"
        }
      >
        <SearchIcon className="mr-2 text-gray-500" />
        <input
          name="component"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-sm outline-none focus:ring-0"
          placeholder="Search components..."
        />
      </div>
      <div className="grid grid-cols-4 gap-2">
        {filteredComponents.map(({ image, title, description }) => (
          <ComponentHolder
            key={title}
            image={image}
            title={title}
            description={description}
          />
        ))}
      </div>
    </div>
  );
}
