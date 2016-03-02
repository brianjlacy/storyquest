/*
 * StoryQuest 2
 *
 * Copyright (c) 2014 Questor GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var quicktour = null;
var creatingprojects = null;
var creatingchapters = null;
var addingmultimedia = null;
var testingbook = null;
var betatests = null;
var exportingbooks = null;

function addingMultimedia () {
    addingmultimedia = new Tourist.Tour({
        tipClass: "Bootstrap",
        tipOptions: { showEffect: "slidein" },
        steps: [
            {
                content: "<p><h3>Adding images and interactivity to your book</h3><p>This tour shows how to upload and add illustrations to your projects. You will also learn how to link to chapters from your content.</p>",
                highlightTarget: false,
                nextButton: true,
                target: $(".logo"),
                my: "top left",
                at: "bottom right"
            },
            {
                content: "<p>To upload assets (including images), you have to switch to the media tab. You can do this by clicking on the 'Media' button in the sidebar.</p><p class='action'>Click on 'Media'.</p>",
                highlightTarget: true,
                nextButton: false,
                target: $("a[href='#/media']"),
                my: "left center",
                at: "right center",
                zIndex: "10000",
                setup: function(tour, options) {
                    $("a[href='#/media']").bind("click", this.onClickHandler);
                },
                teardown: function(tour, options){
                    $("a[href='#/media']").unbind("click", this.onClickHandler);
                },
                bind: ['onClickHandler'],
                onClickHandler: function(tour, options, view, element) {
                    setTimeout(function() { tour.next(); }, 500);
                }
            },
            {
                content: "<p>This section gives you a gallery view of your assets for the currently active project. You can delete items by clicking on the red delete icon that appears on the items when you hover the mouse pointer over them. To add new assets, you can select files from your local disk by clicking on the 'Upload' button. We will skip this for this tutorial.</p><p class='action'>Upload an image from your local computer by clicking 'Upload' and selecting some image. After your new image is visible in the asset grid, click 'Continue' in this tutorial window.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".fileinput-button"),
                setup: function(tour, options) {
                    return { target: $(".fileinput-button") };
                },
                my: "left top",
                at: "right center"
            },
            {
                content: "<p>To insert media assets, including images, into your content, you have to switch to the edit tab.</p><p class='action'>Click on 'Edit'.</p>",
                highlightTarget: true,
                nextButton: false,
                target: $("a[href='#/edit']"),
                my: "left center",
                at: "right center",
                zIndex: "10000",
                setup: function(tour, options) {
                    $("a[href='#/edit']").bind("click", this.onClickHandler);
                },
                teardown: function(tour, options){
                    $("a[href='#/edit']").unbind("click", this.onClickHandler);
                },
                bind: ['onClickHandler'],
                onClickHandler: function(tour, options, view, element) {
                    setTimeout(function() { tour.next(); }, 500);
                }
            },
            {
                content: "<p>By clicking on the + icon, you can add new chapters. The dropdown shows the available chapter types for your project. By selecting one of the types, you add a new chapter of the chosen type to your book.</p><p class='action'>Click on '+'.</p>",
                highlightTarget: true,
                nextButton: false,
                target: $("#addchapterdropdown"),
                my: "left center",
                at: "right center",
                zIndex: "10000",
                setup: function(tour, options) {
                    $("#addchapterdropdown").bind("click", this.onClickHandler);
                    return { target: $("#addchapterdropdown") };
                },
                teardown: function(tour, options) {
                    $("#addchapterdropdown").unbind("click", this.onClickHandler);
                },
                bind: ['onClickHandler'],
                onClickHandler: function(tour, options, view, element) {
                    setTimeout(function() { tour.next(); }, 500);
                }
            },
            {
                content: "<p>The available chapter types are depending on your project and account settings.</p><p class='action'>Select 'Book' from the list.</p>",
                highlightTarget: true,
                nextButton: false,
                target: $(".addnodebutton"),
                my: "left center",
                at: "right center",
                zIndex: "10000",
                setup: function(tour, options) {
                    $(".addnodebutton").bind("click", this.onClickHandler);
                    return { target: $(".addnodebutton") };
                },
                teardown: function(tour, options){
                    $(".addnodebutton").unbind("click", this.onClickHandler);
                },
                bind: ['onClickHandler'],
                onClickHandler: function(tour, options, view, element) {
                    setTimeout(function() { tour.next(); }, 500);
                }
            },
            {
                content: "<p>The book type editor allows you to add images from the media assets to your text by adding shortcode directly into the text. You can enter the shortcode manually, or using a menu by clicking on the 'Insert Image' button from the editor toolbar.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".nav-tabs-custom"),
                setup: function(tour, options) {
                    return { target: $(".nav-tabs-custom") };
                },
                my: "right top",
                at: "left top"
            },
            {
                content: "<p>The editor gives you some powerful support to enter shortcode manually.</p><p class='action'>Click on the editor and enter</p><pre>[i</pre><p>followed by &lt;TAB&gt. Make sure your're on a new line. Then click 'Continue' on this tutorial.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".nav-tabs-custom"),
                setup: function(tour, options) {
                    return { target: $(".nav-tabs-custom") };
                },
                my: "right top",
                at: "left top"
            },
            {
                content: "<p>The editor now inserted a 'snipped' representing the shortcode used to show an image at the location of the shortcode command in the text. There are other shortcodes for inserting different media types or adding interactivity to your content. You now have to select the image you want to insert. The editor also supports you on selecting the right image from your uploaded media.</p><p class='action'>Delete the 'image' template string inside the shortcode and press &lt;CTRL&gt;+&lt;SPACE&gt;. The editor now shows you a dropdown of the available images. Select one from the list.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".nav-tabs-custom"),
                setup: function(tour, options) {
                    return { target: $(".nav-tabs-custom") };
                },
                my: "right top",
                at: "left top"
            },
            {
                content: "<p>You have now added an illustration to your text. If you look at the preview, the illustration will appear at the location of the shortcode command. Refer to the manual for other shortcode for different media types or scripting elements.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".nav-tabs-custom"),
                setup: function(tour, options) {
                    return { target: $(".nav-tabs-custom") };
                },
                my: "right top",
                at: "left top"
            },
            {
                content: "<p>One of the key features of StoryQuest is the non-linear storytelling. From a chapter, you can link to other chapters based on the reader's choice. The simplest non-linear feature is a 'chosen link'. The reader can choose between one or more different links and chooses one. This resembles the mechanic used by 'Choose-your-own-adventure Books'. The specific link feature is based on the used chapter type. In book chapters, the links are also represented by shortcode, while in YouTube chapters, you give a single jump target the reader will be taken to when the video has finished.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".nav-tabs-custom"),
                setup: function(tour, options) {
                    return { target: $(".nav-tabs-custom") };
                },
                my: "right top",
                at: "left top"
            },
            {
                content: "<p>We will now add a chapter jump to your text. To achieve this, we first have to add another chapter.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".nav-tabs-custom"),
                setup: function(tour, options) {
                    return { target: $(".nav-tabs-custom") };
                },
                my: "right top",
                at: "left top"
            },
            {
                content: "<p>We will now add a chapter jump to your text. To achieve this, we first have to add another chapter.</p><p class='action'>Click on '+' and select 'Book'.</p>",
                highlightTarget: true,
                nextButton: false,
                target: $("#addchapterdropdown"),
                my: "left center",
                at: "right center",
                zIndex: "10000",
                setup: function(tour, options) {
                    $("#addchapterdropdown").bind("click", this.onClickHandler);
                    return { target: $("#addchapterdropdown") };
                },
                teardown: function(tour, options) {
                    $("#addchapterdropdown").unbind("click", this.onClickHandler);
                },
                bind: ['onClickHandler'],
                onClickHandler: function(tour, options, view, element) {
                    setTimeout(function() { tour.next(); }, 500);
                }
            },
            {
                content: "<p>Now enter the link shortcode using the editor features. You can also use the 'Link' button in the editor toolbar.</p><p class='action'>Click on the editor, go to a new line and enter the following:</p><pre>[l</pre><p>followed by &lt;TAB&gt.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".nav-tabs-custom"),
                setup: function(tour, options) {
                    return { target: $(".nav-tabs-custom") };
                },
                my: "right top",
                at: "left top"
            },
            {
                content: "<p>You have now added the link shortcode using it's snippet.</p><p class='action'>The first field in the snippet is the link target, the ID of the chapter you want to link to. Delete the word 'nodeid' and press &lt;SPACE&gt+&lt;SPACE&gt. The editor shows you a list of chapters with their IDs and names. You have also the option to create a new chapter and automatically insert the new ID here. Choose an exiting chapter now.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".nav-tabs-custom"),
                setup: function(tour, options) {
                    return { target: $(".nav-tabs-custom") };
                },
                my: "right top",
                at: "left top"
            },
            {
                content: "<p>The 'text' field in the snippet represents the 'button text' the reader will see and can click on in the book. The visual styling of the button depends on your projects and the layout settings.</p><p class='action'>Delete the 'text' template and enter a button text, for example 'Click here if you want to jump to another chapter'.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".nav-tabs-custom"),
                setup: function(tour, options) {
                    return { target: $(".nav-tabs-custom") };
                },
                my: "right top",
                at: "left top"
            },
            {
                content: "<p>You have now added a link to another chapter to your Book chapter. You can add as many links as you like. If you want to examine the graph structure of your book that is implicitly declared by linking from and to chapters, you can visit the 'Preview' tab and look at the chapter tree. This concludes the interactivity tutorial.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".nav-tabs-custom"),
                setup: function(tour, options) {
                    return { target: $(".nav-tabs-custom") };
                },
                my: "right top",
                at: "left top"
            }
        ]});
    return addingmultimedia;
}
function creatingChapters () {
    creatingchapters = new Tourist.Tour({
        tipClass: "Bootstrap",
        tipOptions: { showEffect: "slidein" },
        steps: [
            {
                content: "<p><h3>Creating Chapters and Editing Content</h3><p>This tour shows how to add chapters to your book and edit the content of those chapters.</p>",
                highlightTarget: false,
                nextButton: true,
                target: $(".logo"),
                my: "top left",
                at: "bottom right"
            },
            {
                content: "<p>To see, update or create chapters, you have to switch to the edit tab. You can do this by clicking on the 'Edit' button in the sidebar.</p><p class='action'>Click on 'Edit'.</p>",
                highlightTarget: true,
                nextButton: false,
                target: $("a[href='#/edit']"),
                my: "left center",
                at: "right center",
                zIndex: "10000",
                setup: function(tour, options) {
                    $("a[href='#/edit']").bind("click", this.onClickHandler);
                },
                teardown: function(tour, options){
                    $("a[href='#/edit']").unbind("click", this.onClickHandler);
                },
                bind: ['onClickHandler'],
                onClickHandler: function(tour, options, view, element) {
                    setTimeout(function() { tour.next(); }, 500);
                }
            },
            {
                content: "<p>All currently existing chapters are listed in the chapter list. Every chapter is of a specific type. There are types for displaying text, video, images, or geo maps. The type of the chapter is indicated by the icon preceding the chapter name. To change the chapter names, just click on the name in the list. To edit a chapter, click on the entry itself, and if you would like to delete a chapter, click on the red delete icon that appears if you hover the mouse above an entry.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".box-info"),
                setup: function(tour, options) {
                    return { target: $(".box-info") };
                },
                my: "left top",
                at: "right top"
            },
            {
                content: "<p>By clicking on the + icon, you can add new chapters. The dropdown shows the available chapter types for your project. By selecting one of the types, you add a new chapter of the chosen type to your book.</p><p class='action'>Click on '+'.</p>",
                highlightTarget: true,
                nextButton: false,
                target: $("#addchapterdropdown"),
                my: "left center",
                at: "right center",
                zIndex: "10000",
                setup: function(tour, options) {
                    $("#addchapterdropdown").bind("click", this.onClickHandler);
                    return { target: $("#addchapterdropdown") };
                },
                teardown: function(tour, options) {
                    $("#addchapterdropdown").unbind("click", this.onClickHandler);
                },
                bind: ['onClickHandler'],
                onClickHandler: function(tour, options, view, element) {
                    setTimeout(function() { tour.next(); }, 500);
                }
            },
            {
                content: "<p>The available chapter types are depending on your project and account settings.</p><p class='action'>Select 'Book' from the list.</p>",
                highlightTarget: true,
                nextButton: false,
                target: $(".addnodebutton"),
                my: "left center",
                at: "right center",
                zIndex: "10000",
                setup: function(tour, options) {
                    $(".addnodebutton").bind("click", this.onClickHandler);
                    return { target: $(".addnodebutton") };
                },
                teardown: function(tour, options){
                    $(".addnodebutton").unbind("click", this.onClickHandler);
                },
                bind: ['onClickHandler'],
                onClickHandler: function(tour, options, view, element) {
                    setTimeout(function() { tour.next(); }, 500);
                }
            },
            {
                content: "<p>The editor gives you the opportunity to edit the chapter's content and configuration. The editor changes with the chapter type: in a text chapter type, you will see a text editor here while for a geo map chapter, you will see a complex geo editor here.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".nav-tabs-custom"),
                setup: function(tour, options) {
                    return { target: $(".nav-tabs-custom") };
                },
                my: "right top",
                at: "left top"
            },
            {
                content: "<p>The chapter tab contains the chapter type specific editor. In this case, the chapter editor contains a powerful text editor.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("a[href='#editcontent']"),
                setup: function(tour, options) {
                    return { target: $("a[href='#editcontent']") };
                },
                my: "top right",
                at: "bottom center"
            },
            {
                content: "<p>With the configuration editor, you can set specific configuration settings global for your chapter, such as wallpapers, font colors and other settings.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("a[href='#editconfiguration']"),
                setup: function(tour, options) {
                    return { target: $("a[href='#editconfiguration']") };
                },
                my: "top right",
                at: "bottom center"
            },
            {
                content: "<p>For advanced users, you can add JavaScript code to your chapter to be executed when the chapter is entered or left. With scripting, you can remember reader actions, add dynamic behaviour to your book and let it adapt to the reader's actions.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("a[href='#editonenter']"),
                setup: function(tour, options) {
                    return { target: $("a[href='#editonenter']") };
                },
                my: "top right",
                at: "bottom center"
            },
            {
                content: "<p>Using the scripting, you can also dynamically change the content, like addressing the reader by name or other dynamic elements.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("a[href='#editonexit']"),
                setup: function(tour, options) {
                    return { target: $("a[href='#editonexit']") };
                },
                my: "top right",
                at: "bottom center"
            },
            {
                content: "<p>You can now enter text in the text area. You can use just plain text for the 'Book' chapter type. You can also add links, images or other elements to your text by using the StoryQuest Shortcode or the buttons on the top of the editor. All changes you make to the text are automatically saved to the server and can be live reviewed in open preview windows (or devices).</p><p>This concludes the edit chapter tour.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".ace_editor"),
                setup: function(tour, options) {
                    return { target: $(".ace_editor") };
                },
                my: "right top",
                at: "left top"
            }
        ]
    });
    return creatingchapters;
}
function creatingProjects () {
    creatingprojects = new Tourist.Tour({
        tipClass: "Bootstrap",
        tipOptions: { showEffect: "slidein" },
        steps: [
            {
                content: "<p><h3>Creating Projects</h3><p>This tour will guide you thru creating a new book project. Every book you start is represented by a project inside Haven.</p>",
                highlightTarget: false,
                nextButton: true,
                target: $(".logo"),
                my: "top left",
                at: "bottom right"
            },
            {
                content: "<p>To see, update or create projects, you have to switch to the projects dashboard. You can do this by clicking on the project dropdown and select 'Projects Dashboard'.</p><p class='action'>Click on the projects dropdown.</p>",
                highlightTarget: true,
                nextButton: false,
                target: $(".notifications-menu"),
                my: "right top",
                at: "left center",
                zIndex: "10000",
                setup: function(tour, options) {
                    $(".notifications-menu").bind("click", this.onClickProjects);
                },
                teardown: function(tour, options){
                    $(".notifications-menu").unbind("click", this.onClickProjects);
                },
                bind: ['onClickProjects'],
                onClickProjects: function(tour, options, view, element) {
                    setTimeout(function() { tour.next(); }, 300);

                }
            },
            {
                content: "<p>This is the only way to access the projects list. All other fields and buttons in Haven are always in context of your currently active project.</p><p class='action'>Click on 'Projects Dashboard'.</p>",
                highlightTarget: true,
                nextButton: false,
                target: $("li.footer a[href='#/projects']"),
                my: "top center",
                at: "bottom center",
                setup: function(tour, options) {
                    $("li.footer a[href='#/projects']").bind("click", this.onClickProjects);
                },
                teardown: function(tour, options){
                    $("li.footer a[href='#/projects']").unbind("click", this.onClickProjects);
                },
                bind: ['onClickProjects'],
                onClickProjects: function(tour, options, view, element) {
                    setTimeout(function() { tour.next(); }, 500);
                }
            },
            {
                content: "<p>The projects table shows your projects and gives you the option to edit project properties or delete projects. If you want to switch the project you are currently working on, use the projects dropdown in the top bar.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("#projectsbox"),
                setup: function(tour, options) {
                    return { target: $("#projectsbox") };
                },
                my: "top center",
                at: "bottom center"
            },
            {
                content: "<p>Using the New Project button, you can create new projects.</p><p class='action'>Click on the New Project button.</p>",
                highlightTarget: true,
                nextButton: false,
                target: $("#newProjectButton"),
                setup: function(tour, options) {
                    $("#newProjectButton").bind("click", this.onClickNewProject);
                    return { target: $("#newProjectButton") };
                },
                teardown: function(tour, options){
                    $("#newProjectButton").unbind("click", this.onClickNewProject);
                },
                bind: ['onClickNewProject'],
                onClickNewProject: function(tour, options, view, element) {
                    setTimeout(function() { tour.next(); }, 500);
                },
                my: "right top",
                at: "left center"
            },
            {
                content: "<p>The data given in the new project dialog are stored with your project and will be visible in the projects table.</p><p class='action'>Fill in the values and click 'Ok'.</p>",
                highlightTarget: true,
                nextButton: false,
                target: $("#modalProjectDoOk"),
                zIndex: "10000",
                setup: function(tour, options) {
                    $("#modalProjectDoOk").bind("click", this.onClickNewProject);
                    return { target: $("#modalProjectDoOk") };
                },
                teardown: function(tour, options){
                    $("#modalProjectDoOk").unbind("click", this.onClickNewProject);
                },
                bind: ['onClickNewProject'],
                onClickNewProject: function(tour, options, view, element) {
                    setTimeout(function() { tour.next(); }, 500);
                },
                my: "top center",
                at: "bottom center"
            },
            {
                content: "<p>The new project is now listed in the projects table.</p><p><b>Important:</b> if you want to edit the project, you must select it from the projects dropdown in the top bar. Remember that the currently active project is always visible in the top bar.</p><p>This concludes the new project tour.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("#projectsbox"),
                setup: function(tour, options) {
                    return { target: $("#projectsbox") };
                },
                my: "top center",
                at: "bottom center"
            }
        ]
    });
    return creatingprojects;
}
function quickTour () {
    quicktour = new Tourist.Tour({
        tipClass: "Bootstrap",
        tipOptions: { showEffect: "slidein" },
        steps: [
            {
                content: "<p><h3>Welcome to Haven</h3><p>With StoryQuest Haven, you can create rich content books containing text, illustrations, and video and other multimedia. Create true interactive storytelling and download ready-to-go app packages for every device. StoryQuest uses EveryScreen technology to bring your content to all devices that have display capabilities.</p>",
                highlightTarget: false,
                nextButton: true,
                target: $(".logo"),
                my: "top left",
                at: "bottom right"
            },
            {
                content: "<p>This is the menu sidebar. Using the items here, you can create books, layout, test, and publish them.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".left-side"),
                my: "left center",
                at: "right center"
            },
            {
                content: "<p>This is the top bar. It displays your currently active project that you are working on and your user menu.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".navbar-static-top"),
                my: "top center",
                at: "bottom center"
            },
            {
                content: "<p>Using the sidebar toggle, you can hide the menu sidebar to gain more screen space for the editor.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".sidebar-toggle"),
                my: "top center",
                at: "bottom center"
            },
            {
                content: "<p>The project dropdown shows the current project and, if clicked, gives you the option to switch to another project. The options in the sidebar always refer to the currently active project.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".notifications-menu"),
                my: "top center",
                at: "bottom center"
            },
            {
                content: "<p>The user menu shows the currently logged in user and gives the option to sign out or change your password.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".user-menu"),
                my: "top center",
                at: "bottom center"
            },
            {
                content: "<p>You are currently looking at the dashboard which gives you overview information and access to documentation. You can always go back to the dashboard by clicking the dashboard button in the sidebar.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("ul a[href='#/dashboard']"),
                my: "left center",
                at: "right center"
            },
            {
                content: "<p>The editor is the main focus of your work on a book. The editor allows you to create new chapters and write the text for them.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("ul a[href='#/edit']"),
                my: "left center",
                at: "right center"
            },
            {
                content: "<p>The layout section allows you to change the appearance and behaviour of your book. You can change colors, wallpapers, and create active content by adding JavaScript snippets to your book.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("ul a[href='#/layout']"),
                my: "left center",
                at: "right center"
            },
            {
                content: "<p>With the media section, you can upload and maintain your multimedia assets. You can upload images here which you can use in your books and other files like fonts or videos.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("ul a[href='#/media']"),
                my: "left center",
                at: "right center"
            },
            {
                content: "<p>Using the options in the test section, you can preview your book, jump to any chapter and let people test your book.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $(".treeview"),
                my: "left center",
                at: "right center"
            },
            {
                content: "<p>The deployment section lets you download your book as a ready-to-start apps for various devices and platforms.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("ul a[href='#/deploy']"),
                my: "left center",
                at: "right center"
            },
            {
                content: "<p>The preview button opens a seperate browser window with a live preview of your book. Changes you make to your project using the 'Edit' and 'Layout' sections are automatically updated in open preview windows.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("span#openpreviewbutton"),
                my: "left center",
                at: "right center"
            },
            {
                content: "<p>You can also use your phone or tablet device to display the preview. This button shows a QR code that can be scanned by your device to open the preview on the phone or tablet. Those previews are also live-updated upon changes to the content or layout of your book.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("span#openpreviewqr"),
                my: "left center",
                at: "right center"
            },
            {
                content: "<p>You can also use your phone or tablet device to display the preview. This button shows a QR code that can be scanned by your device to open the preview on the phone or tablet. Those previews are also live-updated upon changes to the content or layout of your book.</p>",
                highlightTarget: true,
                nextButton: true,
                target: $("html"),
                my: "left center",
                at: "right center"
            },
            {
                content: "<p>This concludes the quick tour on the Haven editor. Feel free to look into other tours or start exploring on your own.</p>",
                highlightTarget: false,
                nextButton: true,
                target: $(".logo"),
                my: "top left",
                at: "bottom right"
            }
        ]
    });
    return quicktour;
}
