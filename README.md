## Inspiration:
We were inspired by the app Yassir, which acts as an access point for people to order rides, food, and groceries. We wanted to do the same, yet focused more on travel needs (rides, hotels, flights) as well as implement a way for people to collaborate on a process usually done by one person.

## What it does:
Planning a group trip is difficult for a multitude of reasons, such as arranging flights, hotels, and the overall personal interests of the individuals. CoBooked offers a central website in which the user can create and join "Trips" that include information about these factors. This way, there is less anxiety about coordination and offers a structure for those who appreciate a well-made itinerary to follow. Users also have the option to suggest activities to their trips, and for those who are indecisive, they can vote on options others have given them or be recommended by our website, which uses their personal preferences as a guideline.

## How we built it

Our website development used a combination of Framer for web design and features, css for UI design, SupaBase, GitHub, next.js, and was overall deployed and tested by Vercel. We integrated SkyScanners B2B API to detect real flights and prices. Then for the suggested activities we implemented an AI model using the AI SDK to generate personalized activity suggestions based on user preferences and trip details.

## Challenges we ran into
One of the biggest challenges we faced was implementing the real-time data using the API into the webapp. Merging git repositories ate up most of our time at the end, given that we were all working on different sectors and angles of the website. For example, once we added the matching game to come up with a destination, it was difficult to input the real-time information from the API and have it linked to the resulting destination simultaneously. We had to be careful of the order we ran things, given the reliability of some sections on others. 

## Accomplishments that we're proud of
We are proud of our feature to provide real destination suggestions based on personal preferences, and adding a way for members of the group to rank the suggestions. As our mission statement says, given the expensive nature of travel, it was central to our mission that members were able to enjoy their stay wherever they went and that we were able to cater to whatever type of person uses our application. 


## What we learned
We learned that we should be more intentional about creating pages linked to other pages we know are being worked on separately. As mentioned before, the biggest challenge was merging the different versions/sections of code we had been working on for countless hours. Had we taken into account how the frontend and backend of our website would integrate together we would not have had to work backwards on lots of the work we had done individually. This would have given us more time to be more detailed in our work and carry out more of the amazing ideas we had for CoBooked. 


## What's next for CoBooked
Our vision for CoBooked is to implement more tools to make it a hub for travel planning. Some of the ideas we weren’t able to get to were taking the information and activities planned from each group's “Trip” and creating an actual itinerary for the day/week/ or however long the user's stay is. The user would have the opportunity to link their Google Calendar, TimeTree, or other calendar apps either for their own purposes or also in a shared group calendar. Additionally, we wanted to implement Life360 and their “Circle” concept into the webapp, not only to be able to give live recommendations based on the user's location, but also for safety within the group trip. We see this being very appealing, particularly for guardians and underage individuals traveling to new places. Lastly, given the trouble linking various projects, we did not have time to add rides or hotels to the services CoBooked provides. Yet now that we are able to add the flights, it will be a smoother application process in the future. We look forward to developing CoBooked into a mobile version, making our notifications more effective and user-friendly.

Link: https://v0-tripmate-j.vercel.app
