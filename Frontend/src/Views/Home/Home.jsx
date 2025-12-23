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
import ViewAllCard from '@/components/Home/ViewAllCard';

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
        <ViewAllCard to={viewAllTo} />
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
      <div ref={scrollContainerRef} className="w-full overflow-x-auto -mx-4 px-4 scroll-smooth" style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none' }}>
        <div className="flex gap-4 snap-x snap-mandatory pb-2">
          {top.map((item, idx) => (
            <div key={item?._id ?? idx} className="snap-start min-w-[45%] sm:min-w-[48%]">{renderItem(item)}</div>
          ))}

          <div className="snap-start min-w-[45%] sm:min-w-[48%]">
            <ViewAllCard to={viewAllTo} />
          </div>
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoSlideTimerRef = useRef(null);
  const transitionTimeoutRef = useRef(null);

  const goToSlide = (newIndex, resetTimer = true) => {
    if (isTransitioning || newIndex === index) return;
    setIsTransitioning(true);
    setIndex(newIndex);
    
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 700);

    if (resetTimer) {
      resetAutoSlide();
    }
  };

  const handleNext = () => {
    if (!heroes || heroes.length <= 1) return;
    const newIndex = (index + 1) % heroes.length;
    goToSlide(newIndex, true);
  };

  const handlePrev = () => {
    if (!heroes || heroes.length <= 1) return;
    const newIndex = (index - 1 + heroes.length) % heroes.length;
    goToSlide(newIndex, true);
  };

  const handleDotClick = (i) => {
    goToSlide(i, true);
  };

  const resetAutoSlide = () => {
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
      autoSlideTimerRef.current = null;
    }
    
    if (!isPaused && heroes && heroes.length > 1) {
      autoSlideTimerRef.current = setInterval(() => {
        setIndex((prevIndex) => {
          const newIndex = (prevIndex + 1) % heroes.length;
          setIsTransitioning(true);
          if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
          }
          transitionTimeoutRef.current = setTimeout(() => {
            setIsTransitioning(false);
          }, 700);
          return newIndex;
        });
      }, 5000);
    }
  };

  // Auto-slide effect
  useEffect(() => {
    if (!heroes || heroes.length <= 1) {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
      return;
    }

    if (isPaused) {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
        autoSlideTimerRef.current = null;
      }
      return;
    }

    // Start auto-slide when not paused
    resetAutoSlide();

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [heroes, isPaused, heroes.length]);

  if (!heroes || heroes.length === 0) {
    return (
      <section className="relative h-[35vh] sm:h-[60vh] md:h-[80vh] lg:h-[80vh] overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-purple-50 via-white to-blue-50">
          <div className="absolute inset-0 flex flex-col justify-center items-start max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-3 sm:mb-6 leading-tight bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                ZAUQ
              </h1>
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-10 text-white font-light max-w-2xl">
                Welcome to our store - Discover the latest trends
              </p>
              <Link to="/products">
                <button className="group rounded-full px-6 sm:px-10 py-2.5 sm:py-4 bg-transparent text-black text-xs sm:text-base font-semibold border-2 border-black hover:bg-black hover:text-white transition-all duration-300 inline-flex items-center gap-2 sm:gap-3">
                  Shop Now
                  <FaLongArrowAltRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 transform -rotate-45 group-hover:rotate-0 group-hover:translate-x-1" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const currentHero = heroes[index];

  return (
    <section 
      className="relative h-[35vh] sm:h-[60vh] md:h-[80vh] lg:h-[80vh] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)} 
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Image Slider with Smooth Transition */}
      <div className="absolute inset-0">
        {heroes.map((hero, i) => (
          <div
            key={hero?._id || i}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              i === index 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
            style={{
              backgroundImage: hero?.image 
                ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.4)), url(${hero.image})` 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
      </div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-black/50 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative h-full flex flex-col justify-center items-start max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">
        <div className="max-w-3xl">
          <h1 
            className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-3 sm:mb-6 leading-tight text-white drop-shadow-lg transition-all duration-700 ${
              isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            {currentHero?.title || 'ZAUQ'}
          </h1>
          
          {currentHero?.subtitle && (
            <p 
              className={`text-sm sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-10 text-white font-light max-w-2xl drop-shadow-md transition-all duration-700 delay-100 ${
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}
            >
              {currentHero.subtitle}
            </p>
          )}
          
          <div 
            className={`transition-all duration-700 delay-200 ${
              isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            <Link to={currentHero?.ctaLink || '/products'}>
              <button className="group rounded-full px-6 sm:px-10 py-2.5 sm:py-4 bg-transparent text-white text-xs sm:text-base font-semibold border-2 border-white hover:bg-white hover:text-black transition-all duration-300 inline-flex items-center gap-2 sm:gap-3">
                {currentHero?.ctaText || 'Shop Now'}
                <FaLongArrowAltRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 transform -rotate-45 group-hover:rotate-0 group-hover:translate-x-1" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows - Visible on hover */}
      {heroes.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            disabled={isTransitioning}
            className="absolute left-4 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 p-2 sm:p-3 lg:p-4 bg-white/20 backdrop-blur-md rounded-full shadow-lg hover:bg-white/40 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
          </button>
          
          <button
            onClick={handleNext}
            disabled={isTransitioning}
            className="absolute right-4 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 p-2 sm:p-3 lg:p-4 bg-white/20 backdrop-blur-md rounded-full shadow-lg hover:bg-white/40 transition-all duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
          </button>
        </>
      )}

      {/* Pagination Dots */}
      {heroes.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-8 lg:bottom-10 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-3 bg-black/20 backdrop-blur-sm px-3 py-1.5 sm:px-6 sm:py-3 rounded-full">
          {heroes.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              disabled={isTransitioning}
              className={`h-1.5 sm:h-2.5 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
                i === index 
                  ? 'bg-white w-6 sm:w-10 shadow-md' 
                  : 'bg-white/50 w-1.5 sm:w-2.5 hover:bg-white/75 hover:w-3 sm:hover:w-4'
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {heroes.length > 1 && !isPaused && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div 
            className="h-full bg-white shadow-lg transition-all"
            style={{
              width: isTransitioning ? '0%' : '100%',
              transition: isTransitioning ? 'none' : 'width 5000ms linear'
            }}
          />
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
    <div className="w-full bg-brand-text-primary">
      <HeroSlider heroes={hero} />

      {featuredCollections.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <h2 className="text-xl sm:text-2xl font-light text-brand-primary tracking-tight mb-6 sm:mb-8 uppercase text-center">Featured Collections</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            {featuredCollections.map((c) => (
              <div key={c._id} className="aspect-5/3">
                <FeaturedCard collection={c} />
              </div>
            ))}
          </div>
        </section>
      )}

      {collections.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12 sm:py-16">
          <h2 className="text-xl sm:text-2xl font-light text-brand-primary tracking-tight mb-6 sm:mb-8 uppercase text-center">Collections</h2>

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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-brand-primary tracking-tight mb-6 sm:mb-8 uppercase text-center">Featured Products</h2>

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
          <h2 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight mb-6 sm:mb-8 uppercase text-center">Customer Reviews</h2>
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
