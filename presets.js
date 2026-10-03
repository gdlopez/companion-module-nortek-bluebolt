const { combineRgb } = require("@companion-module/base");

exports.updatePresets = function () {
  const presets = {};
  const structure = [];

  if (
    this.model.protocol === "udp" &&
    this.model.variables &&
    this.model.variables.power === true &&
    this.model.banks > 0 &&
    this.config &&
    this.config.pollingEnable === true
  ) {
    const togglePresetIds = [];

    for (let bank = 1; bank <= this.model.banks; bank++) {
      const presetId = `bank_toggle_${bank}`;

      presets[presetId] = {
        type: "simple",
        name: `Toggle Bank ${bank}`,
        style: {
          text: `Bank ${bank}\nToggle`,
          size: "14",
          color: combineRgb(255, 255, 255),
          bgcolor: combineRgb(180, 0, 0),
        },
        steps: [
          {
            down: [
              {
                actionId: "udp_cmd_power",
                options: {
                  id_bank: bank,
                  id_power_option: "toggle",
                },
              },
            ],
            up: [],
          },
        ],
        feedbacks: [
          {
            feedbackId: "powerStatus",
            options: {
              bank: bank,
              option: "1",
            },
            style: {
              bgcolor: combineRgb(0, 204, 0),
              color: combineRgb(0, 0, 0),
            },
          },
        ],
      };

      togglePresetIds.push(presetId);
    }

    structure.push({
      id: "bank_power",
      name: "Bank Power",
      definitions: togglePresetIds,
    });
  }

  if (this.model.id === "m4320") {
    const outletTogglePresetIds = [];
    const outletOnPresetIds = [];
    const outletOffPresetIds = [];
    const outletCyclePresetIds = [];

    for (let outlet = 1; outlet <= this.model.banks; outlet++) {
      const statusFeedback = {
        feedbackId: "outletStatus",
        options: { outlet, state: "ON" },
        style: {
          bgcolor: combineRgb(0, 204, 0),
          color: combineRgb(0, 0, 0),
        },
      };

      const definitions = [
        {
          suffix: "toggle",
          name: `Toggle Outlet ${outlet}`,
          text: `Outlet ${outlet}\nToggle`,
          actionId: "telnet_cmd_power",
          options: { id_bank: outlet, id_power_option: "TOGGLE" },
          feedbacks: [statusFeedback],
          target: outletTogglePresetIds,
        },
        {
          suffix: "on",
          name: `Outlet ${outlet} On`,
          text: `Outlet ${outlet}\nON`,
          actionId: "telnet_cmd_power",
          options: { id_bank: outlet, id_power_option: "ON" },
          feedbacks: [statusFeedback],
          target: outletOnPresetIds,
        },
        {
          suffix: "off",
          name: `Outlet ${outlet} Off`,
          text: `Outlet ${outlet}\nOFF`,
          actionId: "telnet_cmd_power",
          options: { id_bank: outlet, id_power_option: "OFF" },
          feedbacks: [],
          target: outletOffPresetIds,
        },
        {
          suffix: "cycle",
          name: `Cycle Outlet ${outlet}`,
          text: `Outlet ${outlet}\nCycle 30s`,
          actionId: "telnet_cmd_cycle",
          options: { id_bank: outlet, id_delay: 30 },
          feedbacks: [statusFeedback],
          target: outletCyclePresetIds,
        },
      ];

      for (const definition of definitions) {
        const presetId = `outlet_${outlet}_${definition.suffix}`;
        presets[presetId] = {
          type: "simple",
          name: definition.name,
          style: {
            text: definition.text,
            size: "14",
            color: combineRgb(255, 255, 255),
            bgcolor: combineRgb(180, 0, 0),
          },
          steps: [
            {
              down: [
                {
                  actionId: definition.actionId,
                  options: definition.options,
                },
              ],
              up: [],
            },
          ],
          feedbacks: definition.feedbacks,
        };
        definition.target.push(presetId);
      }
    }

    structure.push({
      id: "m4320_outlet_power",
      name: "M4320 Outlet Power",
      definitions: [
        ...outletTogglePresetIds,
        ...outletOnPresetIds,
        ...outletOffPresetIds,
        ...outletCyclePresetIds,
      ],
    });

    const systemPresets = [
      ["all_on", "All Outlets On", "All\nON", "telnet_cmd_trigger", { id_trigger_option: "!ALL_ON" }],
      ["all_off", "All Outlets Off", "All\nOFF", "telnet_cmd_trigger", { id_trigger_option: "!ALL_OFF" }],
      ["green_button", "Green Button Sequence", "Green\nSequence", "telnet_cmd_trigger", { id_trigger_option: "!GREEN_BUTTON" }],
      ["reboot_1", "Reboot Group 1", "Reboot\n1", "telnet_cmd_trigger", { id_trigger_option: "!REBOOT_1" }],
      ["reboot_2", "Reboot Group 2", "Reboot\n2", "telnet_cmd_trigger", { id_trigger_option: "!REBOOT_2" }],
      ["refresh", "Refresh Status", "Refresh\nStatus", "telnet_refresh_status", {}],
    ];
    const systemPresetIds = [];

    for (const [id, name, text, actionId, options] of systemPresets) {
      const presetId = `m4320_${id}`;
      presets[presetId] = {
        type: "simple",
        name,
        style: {
          text,
          size: "14",
          color: combineRgb(255, 255, 255),
          bgcolor: combineRgb(70, 70, 70),
        },
        steps: [{ down: [{ actionId, options }], up: [] }],
        feedbacks: [],
      };
      systemPresetIds.push(presetId);
    }

    structure.push({
      id: "m4320_system",
      name: "M4320 System Controls",
      definitions: systemPresetIds,
    });

    const profilePresetIds = [];
    for (let profile = 1; profile <= 4; profile++) {
      const presetId = `m4320_profile_${profile}`;
      presets[presetId] = {
        type: "simple",
        name: `Select Profile ${profile}`,
        style: {
          text: `Profile\n${profile}`,
          size: "14",
          color: combineRgb(255, 255, 255),
          bgcolor: combineRgb(0, 70, 140),
        },
        steps: [
          {
            down: [
              {
                actionId: "telnet_set_profile",
                options: { profile: profile.toString() },
              },
            ],
            up: [],
          },
        ],
        feedbacks: [
          {
            feedbackId: "profileSelected",
            options: { profile: profile.toString() },
            style: {
              bgcolor: combineRgb(0, 204, 0),
              color: combineRgb(0, 0, 0),
            },
          },
        ],
      };
      profilePresetIds.push(presetId);
    }

    structure.push({
      id: "m4320_profiles",
      name: "M4320 Profiles",
      definitions: profilePresetIds,
    });

    const statusPresets = [
      ["power_normal", "Power Normal", "Power\nNormal", "powerStatus", { state: "NORMAL" }],
      ["breaker_fault", "Breaker Fault", "Breaker\nFAULT", "faultStatus", { fault: "breaker", state: "FAULT" }],
      ["wiring_fault", "Wiring Fault", "Wiring\nFAULT", "faultStatus", { fault: "wire_fault", state: "FAULT" }],
      ["temperature_fault", "Temperature Fault", "Temp\nFAULT", "faultStatus", { fault: "temperature", state: "FAULT" }],
      ["avm_fault", "AVM Fault", "AVM\nFAULT", "faultStatus", { fault: "avm", state: "FAULT" }],
      ["trigger_input", "DC Trigger Active", "DC Trigger\nON", "triggerInput", { state: "ON" }],
    ];
    const statusPresetIds = [];

    for (const [id, name, text, feedbackId, options] of statusPresets) {
      const presetId = `m4320_status_${id}`;
      presets[presetId] = {
        type: "simple",
        name,
        style: {
          text,
          size: "14",
          color: combineRgb(255, 255, 255),
          bgcolor: combineRgb(70, 70, 70),
        },
        steps: [{ down: [], up: [] }],
        feedbacks: [
          {
            feedbackId,
            options,
            style: {
              bgcolor: combineRgb(255, 0, 0),
              color: combineRgb(255, 255, 255),
            },
          },
        ],
      };
      statusPresetIds.push(presetId);
    }

    structure.push({
      id: "m4320_status",
      name: "M4320 Status",
      definitions: statusPresetIds,
    });
  }

  this.setPresetDefinitions(structure, presets);
};
