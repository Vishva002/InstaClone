import React from 'react';
import Story from '../feed/Story';
import Post from '../feed/Post';
import RightBar from '../rightBar/RightBar';

function Home() {
  return (
    <div className="flex gap-12 max-w-[850px] w-full mx-auto justify-center">
      {/* Feed Column */}
      <div className="flex-1 max-w-[470px] w-full min-w-0">
        <Story />
        <Post />
      </div>

      {/* Suggestions Column (Right Panel) - Hidden on medium/small viewports */}
      <div className="hidden xl:block w-[319px] shrink-0">
        <div className="sticky top-6">
          <RightBar />
        </div>
      </div>
    </div>
  );
}

export default Home;
