// Clean Home.jsx - final
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaLongArrowAltRight } from 'react-icons/fa';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import FeaturedCard from '@/components/Home/FeaturedCard';
import CollectionsCategory from '@/components/Home/CollectionsCategory';
import ProductCard from '@/components/Home/ProductCard';
import ReviewCard from '@/components/Home/ReviewCard';

import {
  fetchHomepageConfig,
  selectHero,
  selectFeaturedCollections,
  selectCollections,
  selectProducts,
  selectReviews,
  selectHomepageLoading,
  selectHomepageError,
} from '@/redux/slices/homepageSlice';

const GridWithViewAll = ({ items = [], renderItem, viewAllTo = '/products' }) => {
  const top = (items || []).slice(0, 7);
  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {top.slice(0, 4).map((item, idx) => (
          <div key={item?._id ?? idx}>{renderItem(item)}</div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {top.slice(4, 7).map((item, idx) => (
          <div key={item?._id ?? idx + 4}>{renderItem(item)}</div>
        ))}
        <Link to={viewAllTo}>
          <div className="group relative w-full overflow-hidden rounded-2xl shadow-md bg-white cursor-pointer h-44 flex items-center justify-center border border-dashed border-gray-200 hover:shadow-lg transition-shadow">
            <div className="text-center p-4">
              <div className="text-sm font-semibold text-gray-600 uppercase">View all</div>
              <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white font-semibold hover:bg-gray-800 transition-colors">Explore <FaLongArrowAltRight className="w-3 h-3" /></div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

const MobileCarouselWithViewAll = ({ items = [], renderItem, viewAllTo = '/products' }) => {
  const [scrollPos, setScrollPos] = useState(0);
  const scrollContainerRef = useRef(null);
  const top = (items || []).slice(0, 7);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    const newPos = direction === 'left' ? Math.max(0, scrollPos - scrollAmount) : scrollPos + scrollAmount;
    scrollContainerRef.current.scrollLeft = newPos;
    setScrollPos(newPos);
  };

  return (
    <div className="relative">
      <div ref={scrollContainerRef} className="w-full overflow-x-auto -mx-4 px-4 scroll-smooth" style={{ scrollBehavior: 'smooth' }}>
        <div className="flex gap-4 snap-x snap-mandatory pb-2">
          {top.map((item, idx) => (
            <div key={item?._id ?? idx} className="snap-start min-w-[70%] sm:min-w-[48%]">{renderItem(item)}</div>
          ))}

          <Link to={viewAllTo}>
            <div className="snap-start min-w-[70%] sm:min-w-[48%] group relative w-full overflow-hidden rounded-2xl shadow-md bg-white cursor-pointer h-44 flex items-center justify-center border border-dashed border-gray-200">
              <div className="text-center p-4">
                <div className="text-sm font-semibold text-gray-600 uppercase">View all</div>
                <div className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white font-semibold">Explore <FaLongArrowAltRight className="w-3 h-3" /></div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <div className="hidden sm:flex absolute top-1/2 -translate-y-1/2 left-0 right-0 justify-between px-2 pointer-events-none">
        <button onClick={() => scroll('left')} className="pointer-events-auto p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors" aria-label="Scroll left">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => scroll('right')} className="pointer-events-auto p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors" aria-label="Scroll right">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const HeroSlider = ({ heroes = [] }) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!heroes || heroes.length <= 1 || isPaused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % heroes.length), 5000);
    return () => clearInterval(timer);
  }, [heroes, isPaused]);

  if (!heroes || heroes.length === 0) {
    return (
      <section className="relative h-[50vh] sm:h-[65vh] md:h-[86vh] px-4 sm:px-8 lg:px-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)' }}>
        <div className="absolute inset-0 flex flex-col justify-center max-w-6xl mx-auto px-6 sm:px-8 text-black">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 leading-tight">ZAUQ</h1>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl font-light">Welcome to our store</p>
          <div>
            <Link to="/products">
              <button className="rounded-full px-6 sm:px-8 py-2.5 sm:py-3 bg-black text-white font-semibold hover:bg-gray-800 border-2 border-black transition-colors inline-flex items-center gap-2 group">
                Shop Now
                <FaLongArrowAltRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const currentHero = heroes[index];

  return (
    <section className="relative h-[50vh] sm:h-[65vh] md:h-[86vh] px-4 sm:px-8 lg:px-10 overflow-hidden" style={{ backgroundImage: currentHero?.image ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${currentHero.image})` : 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 flex flex-col justify-center max-w-6xl mx-auto px-6 sm:px-8 text-white" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-3 sm:mb-4 leading-tight">{currentHero?.title || 'ZAUQ'}</h1>
        {currentHero?.subtitle && <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 max-w-2xl font-light">{currentHero.subtitle}</p>}
        <div>
          <Link to={currentHero?.ctaLink || '/products'}>
            <button className="rounded-full px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-black font-semibold hover:bg-gray-100 border-2 border-white transition-colors inline-flex items-center gap-2 group">
              {currentHero?.ctaText || 'Shop Now'}
              <FaLongArrowAltRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>

      {heroes.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
          {heroes.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? 'bg-white w-8' : 'bg-white/50 w-2 hover:bg-white/75'}`} aria-label={`Go to slide ${i + 1}`} />
          ))}
        </div>
      )}
    </section>
  );
};

const ReviewsCarousel = ({ reviews = [] }) => {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!reviews || reviews.length <= 1 || isPaused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 5000);
    return () => clearInterval(timer);
  }, [reviews, isPaused]);

  if (!reviews || reviews.length === 0) {
    return <div className="text-center text-gray-500 py-8">No customer reviews yet. Be the first to review!</div>;
  }

  return (
    <div className="relative" onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <div className="relative overflow-hidden">
        <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${index * 100}%)`, width: `${reviews.length * 100}%` }}>
          {reviews.map((review) => (
            <div key={review?._id} className="w-full shrink-0 px-4">
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-center mt-6 flex-wrap">
        {reviews.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} className={`h-2 rounded-full transition-all ${i === index ? 'bg-black w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'}`} aria-label={`Go to review ${i + 1}`} aria-current={i === index} />
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const dispatch = useDispatch();

  const hero = useSelector(selectHero);
  const featuredCollections = useSelector(selectFeaturedCollections) || [];
  const collections = useSelector(selectCollections) || [];
  const products = useSelector(selectProducts) || [];
  const reviews = useSelector(selectReviews) || [];
  const isLoading = useSelector(selectHomepageLoading);
  const error = useSelector(selectHomepageError);

  useEffect(() => {
    dispatch(fetchHomepageConfig());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="w-full py-16 text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-16 text-center">
        <div className="text-red-600 space-y-2">
          <p className="font-semibold text-lg">Failed to load homepage</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <HeroSlider heroes={hero} />

      {featuredCollections.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8 uppercase">Featured Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCollections.map((c) => (
              <FeaturedCard key={c._id} collection={c} />
            ))}
          </div>
        </section>
      )}

      {collections.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase">Collections</h2>
            <Link to="/categories" className="text-sm sm:text-base font-medium text-gray-600 hover:text-black transition-colors">View all</Link>
          </div>

          <div className="hidden lg:block">
            <GridWithViewAll items={collections} renderItem={(collection) => <CollectionsCategory collection={collection} />} viewAllTo="/categories" />
          </div>

          <div className="block lg:hidden">
            <MobileCarouselWithViewAll items={collections} renderItem={(collection) => <CollectionsCategory collection={collection} />} viewAllTo="/categories" />
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight uppercase">Featured Products</h2>
            <Link to="/products" className="text-sm sm:text-base font-medium text-gray-600 hover:text-black transition-colors">View all</Link>
          </div>

          <div className="hidden lg:block">
            <GridWithViewAll items={products} renderItem={(product) => <ProductCard product={product} />} viewAllTo="/products" />
          </div>

          <div className="block lg:hidden">
            <MobileCarouselWithViewAll items={products} renderItem={(product) => <ProductCard product={product} />} viewAllTo="/products" />
          </div>
        </section>
      )}

      {reviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8 uppercase">Customer Reviews</h2>
          <ReviewsCarousel reviews={reviews} />
        </section>
      )}

      {!hero || hero.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500"><p>Homepage configuration not available</p></div>
      )}
    </div>
  );
};

export default Home;
