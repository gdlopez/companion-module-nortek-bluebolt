const { Regex } = require("@companion-module/base");

exports.updateActions = function () {
  var actions = {};

  if (this.model.protocol == "udp") {
    actions["udp_cmd_sequence"] = {
      name: "Sequence On/Off",
      options: [
        {
          type: "dropdown",
          id: "id_sequencedir",
          label: "Direction",
          default: "1",
          choices: [
            { id: "1", label: "On" },
            { id: "0", label: "Off" },
          ],
        },
      ],
      callback: async (event) => {
        this.sendBlueBolt(
          `<sequence>${event.options.id_sequencedir}</sequence>`,
        );
      },
    };
    if (!this.model.smartlink) {
      actions["udp_cmd_reboot"] = {
        name: "Reboot Device",
        options: [],
        callback: async () => {
          this.sendBlueBolt(`<reboot/>`);
        },
      };
    }
    if (this.model.banks > 0) {
      actions["udp_cmd_power"] = {
        name: "Power Action",
        description: "NOTE: Toggle only works if Polling is enabled",
        options: [
          {
            type: "number",
            id: "id_bank",
            label: "Bank",
            default: 1,
            min: 1,
            max: this.model.banks,
          },
          {
            type: "dropdown",
            id: "id_power_option",
            label: "Action",
            default: "on",
            choices: [
              { id: "on", label: "On" },
              { id: "off", label: "Off" },
              { id: "cycle", label: "Cycle" },
              { id: "toggle", label: "Toggle" },
            ],
          },
        ],
        callback: async (event) => {
          let bank = event.options.id_bank;

          switch (event.options.id_power_option) {
            case "on":
              this.sendBlueBolt(`<outlet id="${bank}">1</outlet>`);
              break;
            case "off":
              this.sendBlueBolt(`<outlet id="${bank}">0</outlet>`);
              break;
            case "cycle":
              this.sendBlueBolt(`<cycleoutlet id="${bank}"/>`);
              break;
            case "toggle":
              if (this.config.pollingEnable) {
                var newState = this.varStates[`bank${bank}`] == "1" ? "0" : "1";
                this.sendBlueBolt(`<outlet id="${bank}">${newState}</outlet>`);
              } else {
                this.log(
                  "error",
                  "Action Error: Enable Polling to use the Toggle action",
                );
              }
              break;
          }
        },
      };
      if (!this.model.smartlink) {
        actions["udp_set_delay"] = {
          name: "Set Bank Delay",
          options: [
            {
              type: "number",
              id: "id_bank",
              label: "Bank",
              default: 1,
              min: 1,
              max: this.model.banks,
            },
            {
              type: "dropdown",
              id: "id_delay_type",
              label: "Delay Setting",
              default: "0",
              choices: [
                { id: "0", label: "Off" },
                { id: "1", label: "On" },
                { id: "2", label: "Power Cycle" },
              ],
            },
            {
              type: "number",
              id: "id_delay",
              label: "Delay (s)",
              default: 1,
              min: 0,
              max: 65535,
            },
          ],
          callback: async (event) => {
            let bank = event.options.id_bank;
            let delay = event.options.id_delay;
            this.sendBlueBolt(
              `<set><delay id="${bank}" act="${event.options.id_delay_type}">${delay}</delay></set>`,
            );
          },
        };
      }
    }
    if (this.model.smartlink) {
      actions["udp_cmd_refreshinfo"] = {
        name: "Refresh Info",
        options: [],
        callback: async () => {
          this.sendBlueBolt(`<refreshinfo/>`);
        },
      };
      actions["udp_cmd_refreshsettings"] = {
        name: "Refresh Settings",
        options: [],
        callback: async () => {
          this.sendBlueBolt(`<refreshsettings/>`);
        },
      };
    }
    if (this.model.id == "bb232") {
      actions["udp_cmd_enumerate"] = {
        name: "Enumerate",
        options: [],
        callback: async () => {
          this.sendBlueBolt(`<enumerate/>`);
        },
      };
      actions["udp_cmd_rollcall"] = {
        name: "Roll Call",
        options: [],
        callback: async () => {
          this.sendBlueBolt(`<rollcall/>`);
        },
      };
    }
    if (this.model.id == "m4000") {
      actions["udp_set_triggerena"] = {
        name: "Enable Trigger",
        options: [
          {
            type: "number",
            id: "id_bank",
            label: "Bank",
            default: 1,
            min: 1,
            max: this.model.banks,
          },
          {
            type: "dropdown",
            id: "id_triggerena",
            label: "Trigger",
            default: "0",
            choices: [
              { id: "0", label: "Disabled" },
              { id: "1", label: "Enabled" },
            ],
          },
        ],
        callback: async (event) => {
          let bank = event.options.id_bank;
          this.sendBlueBolt(
            `<set><triggerena id="${bank}">${event.options.id_triggerena}</triggerena></set>`,
          );
        },
      };
      actions["udp_set_brightness"] = {
        name: "Set Brightness",
        options: [
          {
            type: "number",
            label: "Brightness",
            id: "id_brightness",
            default: 1,
            min: 1,
            max: 5,
          },
        ],
        callback: async (event) => {
          let brightness = this.clamp(
            parseInt(event.options.id_brightness),
            1,
            5,
          );
          this.sendBlueBolt(
            `<set><brightness>${brightness}</brightness></set>`,
          );
        },
      };
    }
  } else if (this.model.protocol == "telnet") {
    actions["telnet_cmd_trigger"] = {
      name: "Trigger Action",
      options: [
        {
          type: "dropdown",
          id: "id_trigger_option",
          label: "Action",
          choices: [
            { id: "!GREEN_BUTTON", label: "Green Button" },
            { id: "!REBOOT_1", label: "Reboot 1" },
            { id: "!REBOOT_2", label: "Reboot 2" },
            { id: "!ALL_OFF", label: "All Off" },
            { id: "!ALL_ON", label: "All On" },
          ],
        },
      ],
      callback: async (event) => {
        this.sendBlueBolt(event.options.id_trigger_option);
      },
    };
    actions["telnet_cmd_power"] = {
      name: "Bank Power Action",
      options: [
        {
          type: "number",
          id: "id_bank",
          label: "Bank",
          default: 1,
          min: 1,
          max: this.model.banks,
        },
        {
          type: "dropdown",
          id: "id_power_option",
          label: "Action",
          default: "ON",
          choices: [
            { id: "ON", label: "On" },
            { id: "OFF", label: "Off" },
            ...(this.model.id == "m4320"
              ? [{ id: "TOGGLE", label: "Toggle" }]
              : []),
          ],
        },
      ],
      callback: async (event) => {
        let bank = event.options.id_bank;
        let powerOption = event.options.id_power_option;
        if (powerOption == "TOGGLE") {
          const currentState = this.varStates[`outlet${bank}`];
          if (currentState != "ON" && currentState != "OFF") {
            this.log("error", "Toggle requires a known outlet state; refreshing status");
            this.sendBlueBolt("?OUTLETSTAT");
            return;
          }
          powerOption = currentState == "ON" ? "OFF" : "ON";
        }
        this.sendBlueBolt(`!SWITCH ${bank} ${powerOption}`);
      },
    };
    if (this.model.id == "m4320") {
      actions["telnet_cmd_cycle"] = {
        name: "Cycle Outlet",
        options: [
          {
            type: "number",
            id: "id_bank",
            label: "Outlet",
            default: 1,
            min: 1,
            max: this.model.banks,
          },
          {
            type: "number",
            id: "id_delay",
            label: "Off Time (seconds)",
            default: 30,
            min: 1,
            max: 65535,
          },
        ],
        callback: async (event) => {
          this.sendBlueBolt(
            `#CYCLE ${event.options.id_bank}:${event.options.id_delay}`,
          );
        },
      };
      actions["telnet_set_feedback"] = {
        name: "Set Feedback Mode",
        options: [
          {
            type: "dropdown",
            id: "mode",
            label: "Unsolicited Feedback",
            default: "ON",
            choices: [
              { id: "ON", label: "On" },
              { id: "OFF", label: "Off" },
            ],
          },
        ],
        callback: async (event) => {
          this.sendBlueBolt(`!SET_FEEDBACK ${event.options.mode}`);
        },
      };
      actions["telnet_set_linefeed"] = {
        name: "Set Linefeed Mode",
        options: [
          {
            type: "dropdown",
            id: "mode",
            label: "Linefeed",
            default: "ON",
            choices: [
              { id: "ON", label: "On" },
              { id: "OFF", label: "Off" },
            ],
          },
        ],
        callback: async (event) => {
          this.sendBlueBolt(`!SET_LINEFEED ${event.options.mode}`);
        },
      };
      actions["telnet_set_profile"] = {
        name: "Set Profile",
        options: [
          {
            type: "dropdown",
            id: "profile",
            label: "Profile",
            default: "1",
            choices: [1, 2, 3, 4].map((profile) => ({
              id: profile.toString(),
              label: `Profile ${profile}`,
            })),
          },
        ],
        callback: async (event) => {
          this.sendBlueBolt(`!SET_PROFILE ${event.options.profile}`);
        },
      };
      actions["telnet_reset_all"] = {
        name: "Restore Factory Settings",
        description: "Resets triggers, delays, feedback, linefeed, and profile",
        options: [],
        callback: async () => {
          this.sendBlueBolt("!RESET_ALL");
        },
      };
      actions["telnet_query"] = {
        name: "Query Device",
        options: [
          {
            type: "dropdown",
            id: "query",
            label: "Query",
            default: "?OUTLETSTAT",
            choices: [
              { id: "?ID", label: "Identity and Firmware" },
              { id: "?FAULTSTAT", label: "Fault Status" },
              { id: "?TRIGSTAT", label: "Trigger Status" },
              { id: "?OUTLETSTAT", label: "Outlet Status" },
              { id: "?POWERSTAT", label: "Power Status" },
              { id: "?VOLTAGE", label: "Line Voltage" },
              { id: "?CURRENT", label: "Current Draw" },
              { id: "?HELP", label: "Command Help" },
              { id: "?LIST_CONFIG", label: "Configuration" },
            ],
          },
        ],
        callback: async (event) => {
          this.sendBlueBolt(event.options.query);
        },
      };
      actions["telnet_refresh_status"] = {
        name: "Refresh All Status",
        options: [],
        callback: async () => {
          this.refreshM4320Status();
        },
      };
    }
    actions["telnet_set_trigger_source"] = {
      name: "Set Trigger Source",
      options: [
        {
          type: "number",
          id: "id_bank",
          label: "Bank:",
          default: 1,
          min: 1,
          max: this.model.banks,
        },
        {
          type: "dropdown",
          id: "id_trigger_source",
          label: "Action",
          default: "NONE",
          choices: [
            { id: "NONE", label: "None" },
            { id: "BUTTON_1", label: "Button 1" },
            { id: "BUTTON_2", label: "Button 2" },
            { id: "BUTTON_GREEN", label: "Green Button" },
            { id: "TRIGIN", label: "DC Trigger" },
          ],
        },
      ],
      callback: async (event) => {
        let bank = event.options.id_bank;
        this.sendBlueBolt(
          `!SET_TRIGGER ${bank} ${event.options.id_trigger_source}`,
        );
      },
    };
    actions["telnet_set_reboot_delay"] = {
      name: "Set Reboot Delay",
      options: [
        {
          type: "number",
          id: "id_delay_1",
          label: "Button 1 Delay",
          default: 1,
          min: 1,
          max: 255,
        },
        {
          type: "number",
          id: "id_delay_2",
          label: "Button 2 Delay",
          default: 1,
          min: 1,
          max: 255,
        },
      ],
      callback: async (event) => {
        let delay1 = event.options.id_delay_1;
        let delay2 = event.options.id_delay_2;
        this.sendBlueBolt(`!SET_REBOOT_DELAY ${delay1} ${delay2}`);
      },
    };
    actions["telnet_set_delay"] = {
      name: "Set Delay",
      options: [
        {
          type: "number",
          id: "id_bank",
          label: "Bank:",
          default: 1,
          min: 1,
          max: this.model.banks,
        },
        {
          type: "number",
          id: "id_delay_on",
          label: "On Delay",
          default: 1,
          min: this.model.id == "m4320" ? 0 : 1,
          max: 255,
        },
        {
          type: "number",
          id: "id_delay_off",
          label: "Off Delay",
          default: 1,
          min: this.model.id == "m4320" ? 0 : 1,
          max: 255,
        },
      ],
      callback: async (event) => {
        let bank = event.options.id_bank;
        let delayOn = event.options.id_delay_on;
        let delayOff = event.options.id_delay_off;
        this.sendBlueBolt(`!SET_DELAY ${bank} ${delayOn} ${delayOff}`);
      },
    };
  }

  this.setActionDefinitions(actions);
};
