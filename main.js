document.addEventListener("DOMContentLoaded", function() {
	if(innerWidth < 1000) {
		var e = document.createElement('p');
		e.textContent = "Not designed for mobile devices";
		e.style.color = "red";
		var body = document.getElementsByTagName("body")[0];
		body.insertBefore(e, body.firstChild);
	}
	document.getElementById("input").addEventListener("input", function() {
		var inText = document.getElementById("input").value;
		var word = "";
		var mode = "main";
		var prev = [];
		var outText = "";
		for(const c of inText) {
			if(isHex(c)) {
				word += c;
				if(word.length == 8) {
					switch(mode) {
						case "main":
							var mp = getMainFromPrefix(word);
							mode = mp.mode;
							if(mp.prev != null) {
								prev.push(mp.prev);
							}
						break;
						case "32w":
							outText += "32-bit write 0x"+word+" to 0x"+prev[0]+" + offset\n";
							mode = "main";
							prev = [];
						break;
						case "16w":
							outText += "16-bit write 0x"+word.substr(4)+" to 0x"+prev[0]+" + offset\n";
							mode = "main";
							prev = [];
						break;
						case "8w":
							outText += "8-bit write 0x"+word.substr(6)+" to 0x"+prev[0]+" + offset\n";
							mode = "main";
							prev = [];
						break;
						case "32lt":
							var dest = prev[0] == "0000000" ? "offset" : "0x"+prev[0];
							outText += "32-bit less than: execute block if value at "+dest+" < 0x"+word.padStart(8,"0")+"\n";
							mode = "main";
							prev = [];
						break;
						case "32gt":
							var dest = prev[0] == "0000000" ? "offset" : "0x"+prev[0];
							outText += "32-bit greater than: execute block if value at "+dest+" > 0x"+word+"\n";
							mode = "main";
							prev = [];
						break;
						case "32eq":
							var dest = prev[0] == "0000000" ? "offset" : "0x"+prev[0];
							outText += "32-bit equal to: execute block if value at "+dest+" = 0x"+word+"\n";
							mode = "main";
							prev = [];
						break;
						case "32neq":
							var dest = prev[0] == "0000000" ? "offset" : "0x"+prev[0];
							outText += "32-bit not equal to: execute block if value at "+dest+" != 0x"+word+"\n";
							mode = "main";
							prev = [];
						break;
						case "16lt":
							var dest = prev[0] == "0000000" ? "offset" : "0x"+prev[0];
							outText += "16-bit less than: execute block if value at "+dest+" masked by 0x"+word.substr(0,4)+" < 0x"+word.substr(4)+"\n";
							mode = "main";
							prev = [];
						break;
						case "16gt":
							var dest = prev[0] == "0000000" ? "offset" : "0x"+prev[0];
							outText += "16-bit greater than: execute block if value at "+dest+" masked by 0x"+word.substr(0,4)+" > 0x"+word.substr(4)+"\n";
							mode = "main";
							prev = [];
						break;
						case "16eq":
							var dest = prev[0] == "0000000" ? "offset" : "0x"+prev[0];
							outText += "16-bit greater than: execute block if value at "+dest+" masked by 0x"+word.substr(0,4)+" = 0x"+word.substr(4)+"\n";
							mode = "main";
							prev = [];
						break;
						case "16neq":
							var dest = prev[0] == "0000000" ? "offset" : "0x"+prev[0];
							outText += "16-bit greater than: execute block if value at "+dest+" masked by 0x"+word.substr(0,4)+" != 0x"+word.substr(4)+"\n";
							mode = "main";
							prev = [];
						break;
						case "loff":
							outText += "Load offset register from 0x"+prev[0]+" + offset\n";
							mode = "main";
							prev = [];
						break;
						case "rep":
							outText += "Repeat block 0x"+word+" times\n"
							mode = "main";
							prev = [];
						break;
						case "endif":
							outText += "End most recent conditional block\n";
							mode = "main";
							prev = [];
						break;
						case "endrep":
							outText += "End current repeat block and any conditionals within block\n";
							mode = "main";
							prev = [];
						break;
						case "endcode":
							outText += "End current repeat block, any other conditionals, sets offset and stored to 0\n";
							mode = "main";
							prev = [];
						break;
						case "setoff":
							outText += "Set offset register to 0x"+word+"\n";
							mode = "main";
							prev = [];
						break;
						case "setoff":
							outText += "Set stored register to 0x"+word+"\n";
							mode = "main";
							prev = [];
						break;
						case "32sto4":
							outText += "Saves 32 bits from stored to 0x"+word+" + offset, increments offset by 4\n";
							mode = "main";
							prev = [];
						break;
						case "16sto2":
							outText += "Saves bottom 16 bits from stored to 0x"+word+" + offset, increments offset by 2\n";
							mode = "main";
							prev = [];
						break;
						case "8sto1":
							outText += "Saves bottom 8 bits from stored to 0x"+word+" + offset, increments offset by 1\n";
							mode = "main";
							prev = [];
						break;
						case "32losto":
							outText += "Load stored with 32 bits from 0x"+word+" + offset\n";
							mode = "main";
							prev = [];
						break;
						case "16losto":
							outText += "Load stored with 16 bits from 0x"+word+" + offset\n";
							mode = "main";
							prev = [];
						break;
						case "8losto":
							outText += "Load stored with 8 bits from 0x"+word+" + offset\n";
							mode = "main";
							prev = [];
						break;
						case "addoff":
							outText += "Add 0x"+word+" to offset\n";
							mode = "main";
							prev = [];
						break;
						case "memcop":
							outText += "Copy 0x"+word+" bytes from addresses starting at offset to addresses starting at 0x"+prev[0]+"\n";
							mode = "main";
							prev = [];
						break;
					}
					word = "";
				}
			}
		}
		document.getElementById("output").value = outText;
	});
	event = document.createEvent("HTMLEvents");
    event.initEvent("input");
    event.eventName = "input";
	document.getElementById("input").dispatchEvent(event);
});

function isHex(c) {
	return /[0-9a-fA-f]/.test(c)
}

function getMainFromPrefix(word) {
	var mode, prev;
	switch(word.charAt(0).toUpperCase()) {
		case "0":
		mode = "32w"; prev = word.substr(1); break;
		case "1":
		mode = "16w"; prev = word.substr(1); break;
		case "2":
		mode = "8w"; prev = word.substr(1); break;
		case "3":
		mode = "32lt"; prev = word.substr(1); break;
		case "4":
		mode = "32gt"; prev = word.substr(1); break;
		case "5":
		mode = "32eq"; prev = word.substr(1); break;
		case "6":
		mode = "32neq"; prev = word.substr(1); break;
		case "7":
		mode = "16lt"; prev = word.substr(1); break;
		case "8":
		mode = "16gt"; prev = word.substr(1); break;
		case "9":
		mode = "16eq"; prev = word.substr(1); break;
		case "A":
		mode = "16new"; prev = word.substr(1); break;
		case "B":
		mode = "loff"; prev = word.substr(1); break;
		case "C":
		mode = "rep"; break;
		case "D":
			switch(word.charAt(1).toUpperCase()) {
				case "0":
				mode = "endif"; break;
				case "1":
				mode = "endrep"; break;
				case "2":
				mode = "endcode"; break;
				case "3":
				mode = "setoff"; break;
				case "4":
				mode = "addsto"; break;
				case "5":
				mode = "setsto"; break;
				case "6":
				mode = "32sto4"; break;
				case "7":
				mode = "16sto2"; break;
				case "8":
				mode = "8sto1"; break;
				case "9":
				mode = "32losto"; break;
				case "A":
				mode = "16losto"; break;
				case "B":
				mode = "8losto"; break;
				case "C":
				mode = "addoff"; break;
			}
		break;
		case "E":
		mode = "memwr1"; prev = word.substr(1); break;
		case "F":
		mode = "memcop"; prev = word.substr(1); break;
	}
	return {mode: mode, prev: prev};
}