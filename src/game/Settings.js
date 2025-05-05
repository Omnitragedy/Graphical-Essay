import { reactive, watch } from "vue";
import { emitter } from "./Emitter";

const savedSettings = {
	fullscreen: true,
	quality: "high",
	vr: false,
};

if (typeof window !== "undefined") {
	if (localStorage.getItem("vr")) {
		savedSettings.vr = localStorage.getItem("vr") == "false" ? false : true;
	}
}

export const settings = reactive(savedSettings);

watch(
	() => settings.vr,
	(val, old) => {
		console.log(val, old); // Now val and old will be different when `vr` changes
		if (val !== old) {
			window.location.reload();
		}
		localStorage.setItem("vr", val);
		emitter.emit("vr-select", val);
	}
);

watch(settings, (val, old) => {
	localStorage.setItem("fullscreen", val.fullscreen);
	localStorage.setItem("quality", val.quality);

	emitter.emit("quality", val.quality);
});
