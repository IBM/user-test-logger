# User Test Logger

Tooling user studies tasks is fundamental to reduce the burden of evaluators, practitioners, facilitators, and observers during user interface (UI) evaluations. However, available tools for collecting detailed data (i.e., beyond clicks streams) are paid or have a complex setup. In this context, we propose a general-purpose web browser plugin for Firefox to be used in local user studies. It provides detailed data logging, log download, and reporting features. The tool is freely available so that Human-Computer Interaction (HCI) practitioners can use it as a core tool for empirical evaluations or additional data source in mixed methods evaluations.

## Setup

The easiest way to tryout the tool is to:

1. Download the zip file located at https://github.com/IBM/user-test-logger/archive/master.zip;
2. Unzip the downloaded file and place it at your preferred location;
3. Write about:debugging at the address bar;
4. Click on "Load Temporary add-on";
5. Locate the manifest.json file and selected it;
5. Confirm.

Checkout this video showing the setup procedure:

[![User Test Logger - Setup](http://img.youtube.com/vi/0ihIVZ25s0E/0.jpg)](https://youtu.be/0ihIVZ25s0E "User Test Logger - Setup")

## Logging

Once the plugin is loaded, you will be able to see the "L" icon. After clicking at the "L" icon, you will be able to select the events of interest grouped by type of event, e.g., mouse, keyboard, etc.

Once you select the events of interest, you can click record. After that, all events triggered of the type you selected will be logged.

Checkout this video showing the logging procedure:

[![User Test Logger - Logging](http://img.youtube.com/vi/O1TcKH9kUnY/0.jpg)](https://youtu.be/O1TcKH9kUnY "User Test Logger - Logging")

## Analysis

Checkout this video showing an overview of reporting capabilities:

[![User Test Logger - Analysis](http://img.youtube.com/vi/o6DmDAxE2h4/0.jpg)](https://youtu.be/o6DmDAxE2h4 "User Test Logger - Analysis")

### Usage Graph

The usage graph can also be seen as the combination of walks (non-empty alternating sequence of nodes and edges) representing what, where, and when users performed actions. In the usage graph a node is identified by its label, which is the concatenation of the event name and an identifier of the UI element where the event occurred. Moreover, each node counts on information regarding the total of sessions they occurred, mean distance from the root node, mean timestamp, among others.

For more details, please refer to the paper [WELFIT: A remote evaluation tool for identifying web usage Patterns through client-side logging](https://www.researchgate.net/publication/270914330_WELFIT_A_remote_evaluation_tool_for_identifying_web_usage_Patterns_through_client-side_logging)

### Heatmap


### Gaze Plot
