import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-start text-center py-20 px-4 select-none">
      <h2 className="text-2xl font-bold text-ig-text mb-6">Sorry, this page isn't available.</h2>
      <p className="text-sm text-ig-text max-w-[500px] leading-relaxed mb-6">
        The link you followed may be broken, or the page may have been removed.{' '}
        <Link to="/" className="text-sky-600 dark:text-sky-500 font-semibold no-underline hover:underline">
          Go back to Instagram.
        </Link>
      </p>
    </div>
  );
}

export default NotFound;
