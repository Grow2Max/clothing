"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Collection } from "@/lib/types";

export function CollectionGrid({ items }: { items: Collection[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
      {items.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
        >
          <Link href={`/collections/${c.handle}`} className="group block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-[6px] bg-cream">
              <Image src={c.image} alt={c.title} fill sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-80" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-center">
                <span className="font-serif text-lg text-white drop-shadow">{c.title}</span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
