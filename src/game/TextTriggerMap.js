/**
 * TextTriggerMap
 *
 * Map of TextTrigger IDs -> display text. IDs correspond to the name suffix
 * you use in the GLB node name after the "TextTrigger" prefix.
 *
 * Example GLB node name: "TextTrigger_Intro" -> id = "_Intro" -> normalized to "Intro"
 *
 * Add entries here to control what text is shown for a trigger without embedding
 * the text in the GLB userData.
 */

export const TEXT_TRIGGER_MAP = {
  // Example entries — replace with your real copy
    intro: "Welcome to this snapshot inside my mind! Walk around and explore the exhibits. Proceed towards the glowing boxes for info.",
    bio: "Press Z to zoom to take a closer look at pictures",
    aboutme: "My name is Saurav! I've lived in a lot of places, but I've spent most of my life in the Chicago area.",
    hobbies: "I love learning new skills. Here are some samples of my woodworking, leathercrafting, and a behind-the scenes of this current project.",
    travel: "I love to travel too; so many mysteries in this world. I want to uncover them all!",
    thanks: "Thanks for walking through this display. Though we've finished here, the real-life journey doesn't end here. I hope you enjoyed it! (Press Esc to exit)",
  // Add more mappings: "myTriggerId": "Display text here",
};

export default TEXT_TRIGGER_MAP;
