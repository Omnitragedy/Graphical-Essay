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
    intro: "Welcome to this interactive gallery! Walk (arrow keys or WASD) towards the glowing boxes. They will guide you in the intended order of visiting the exhibits.",
    bio: "This is an interactive gallery. Move the mouse to look around. Press Z to zoom to take a closer look at pictures. Keep moving to the next glowing box you see.",
    aboutme: "I've lived in a lot of places, but I've spent most of my life in the Chicago area.",
    hobbies: "I love learning new skills. Here are some samples of my woodworking, leathercrafting, and a behind-the scenes of this current project.",
    travel: "I love to travel too; so many mysteries in this world. I want to uncover them all!",
    thanks: "Thanks for walking through this display. Though we've finished here, the real-life journey doesn't end here. I hope you enjoyed it! (Press Esc to exit)",
  // Add more mappings: "myTriggerId": "Display text here",
};

export default TEXT_TRIGGER_MAP;
