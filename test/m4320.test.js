const test = require("node:test");
const assert = require("node:assert/strict");
const BlueBoltInstance = require("../index");
const { updateActions } = require("../actions");
const { updatePresets } = require("../presets");

function parserContext() {
  return {
    varStates: {},
    telnetBuffer: "",
    setVariableValues() {},
    checkAllFeedbacks() {},
    parseTelnetMessage: BlueBoltInstance.prototype.parseTelnetMessage,
  };
}

test("parses M4320 status and measurement responses", () => {
  const context = parserContext();

  for (const message of [
    "$OUTLET1 = ON",
    "$VOLTAGE = 121",
    "$CURRENT = 33",
    "$PWR = NORMAL",
    "$BREAKER = OK",
    "$WIRE FAULT = FAULT",
    "$TEMPERATURE = OK",
    "$AVM = OK",
    "$TRIGIN = ON",
  ]) {
    context.parseTelnetMessage(message);
  }

  assert.deepEqual(context.varStates, {
    outlet1: "ON",
    voltage: 121,
    current: 3.3,
    power_status: "NORMAL",
    breaker: "OK",
    wire_fault: "FAULT",
    temperature: "OK",
    avm: "OK",
    trigger_input: "ON",
    last_message: "$TRIGIN = ON",
  });
});

test("parses M4320 identity and configuration responses", () => {
  const context = parserContext();

  for (const message of [
    "$PANAMAX",
    "$M4320-PRO",
    "$FIRMWARE: 1.2.3",
    "$FEEDBACK = ON",
    "$LINEFEED = OFF",
    "$PROFILE = 4",
    "$TRIGGER FOR 2 = BUTTON_GREEN",
    "$DELAY FOR 2 = 0, 15",
    "$REBOOT_DELAY1 = 30",
    "$REBOOT_DELAY2 = 5",
  ]) {
    context.parseTelnetMessage(message);
  }

  assert.deepEqual(context.varStates, {
    vendor: "Panamax",
    device_model: "M4320-PRO",
    firmware: "1.2.3",
    feedback_mode: "ON",
    linefeed_mode: "OFF",
    profile: "4",
    outlet2_trigger: "BUTTON_GREEN",
    outlet2_on_delay: 0,
    outlet2_off_delay: 15,
    reboot1_delay: 30,
    reboot2_delay: 5,
    last_message: "$REBOOT_DELAY2 = 5",
  });
});

test("buffers fragmented Telnet messages", () => {
  const context = parserContext();
  context.incomingDataTelnet = BlueBoltInstance.prototype.incomingDataTelnet;

  context.incomingDataTelnet(Buffer.from("$OUTLET1 = O"));
  context.incomingDataTelnet(Buffer.from("N\r$VOLTAGE = 120\r"));

  assert.equal(context.varStates.outlet1, "ON");
  assert.equal(context.varStates.voltage, 120);
  assert.equal(context.telnetBuffer, "");
});

test("sends Telnet commands through the current TelnetHelper API", () => {
  const sent = [];
  const context = {
    model: { protocol: "telnet" },
    telnet: {
      send(message) {
        sent.push(message);
        return true;
      },
    },
    log() {},
  };

  BlueBoltInstance.prototype.sendBlueBolt.call(context, "?ID");

  assert.deepEqual(sent, ["?ID\r"]);
});

test("exposes every documented M4320 command and query", async () => {
  const sent = [];
  const context = {
    model: { id: "m4320", protocol: "telnet", banks: 8 },
    sendBlueBolt(command) {
      sent.push(command);
    },
    refreshM4320Status() {
      sent.push("REFRESH_ALL");
    },
    setActionDefinitions(actions) {
      this.actions = actions;
    },
  };

  updateActions.call(context);

  assert.deepEqual(
    [
      "telnet_cmd_trigger",
      "telnet_cmd_power",
      "telnet_cmd_cycle",
      "telnet_set_feedback",
      "telnet_set_linefeed",
      "telnet_set_profile",
      "telnet_reset_all",
      "telnet_query",
      "telnet_refresh_status",
      "telnet_set_trigger_source",
      "telnet_set_reboot_delay",
      "telnet_set_delay",
    ].filter((id) => !context.actions[id]),
    [],
  );

  await context.actions.telnet_cmd_cycle.callback({
    options: { id_bank: 2, id_delay: 28 },
  });
  await context.actions.telnet_set_feedback.callback({ options: { mode: "ON" } });
  await context.actions.telnet_set_linefeed.callback({ options: { mode: "OFF" } });
  await context.actions.telnet_set_profile.callback({ options: { profile: "4" } });
  await context.actions.telnet_reset_all.callback();
  await context.actions.telnet_query.callback({ options: { query: "?VOLTAGE" } });

  assert.deepEqual(sent, [
    "#CYCLE 2:28",
    "!SET_FEEDBACK ON",
    "!SET_LINEFEED OFF",
    "!SET_PROFILE 4",
    "!RESET_ALL",
    "?VOLTAGE",
  ]);
});

test("toggles an M4320 outlet from its known state", async () => {
  const sent = [];
  const context = {
    model: { id: "m4320", protocol: "telnet", banks: 8 },
    varStates: { outlet3: "ON" },
    sendBlueBolt(command) {
      sent.push(command);
    },
    log() {},
    setActionDefinitions(actions) {
      this.actions = actions;
    },
  };

  updateActions.call(context);
  await context.actions.telnet_cmd_power.callback({
    options: { id_bank: 3, id_power_option: "TOGGLE" },
  });

  assert.deepEqual(sent, ["!SWITCH 3 OFF"]);
});

test("provides a complete set of useful M4320 presets", () => {
  const context = {
    model: { id: "m4320", protocol: "telnet", banks: 8 },
    config: {},
    setPresetDefinitions(structure, presets) {
      this.structure = structure;
      this.presets = presets;
    },
  };

  updatePresets.call(context);

  assert.equal(Object.keys(context.presets).length, 48);
  assert.deepEqual(
    context.structure.map((group) => group.id),
    [
      "m4320_outlet_power",
      "m4320_system",
      "m4320_profiles",
      "m4320_status",
    ],
  );
  assert.equal(context.structure[0].definitions.length, 32);
  assert.ok(
    context.structure.every((section) =>
      section.definitions.every((presetId) => typeof presetId === "string"),
    ),
  );
  assert.ok(
    context.structure.every((section) =>
      section.definitions.every((presetId) => context.presets[presetId]),
    ),
  );
  assert.equal(
    context.presets.outlet_1_toggle.steps[0].down[0].actionId,
    "telnet_cmd_power",
  );
  assert.equal(
    context.presets.outlet_8_cycle.steps[0].down[0].options.id_delay,
    30,
  );
  assert.equal(
    context.presets.m4320_status_breaker_fault.feedbacks[0].feedbackId,
    "faultStatus",
  );
});
