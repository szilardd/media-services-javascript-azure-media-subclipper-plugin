﻿/// <reference path='../../../../azuremediaplayer.d.ts' />
/// <reference path='../Interfaces/IEventSource.ts' />
/// <reference path='../Modules/Common.ts' />
/// <reference path='../Modules/AMVEClipData.ts' />
/// <reference path='../Modules/KeyboardShortcutConfig.ts' />
/// <reference path='../Modules/ThumbnailData.ts' />
/// <reference path='../Modules/AMVEUX.ts' />
/// <reference path='../Modules/SubmitDialogConfig.ts' />

module amp {
    /**
     * AMVE plugin instantiation
     */
    plugin('AMVE', function AMVEPlugin(options: Object) {
        var _player: amp.Player = this;
        var _amveCore: AMVE.AMVECore;

        if (options && options['containerId']) {
            _amveCore = new AMVE.AMVECore(_player, options);
        }
        // custom expose amve fully temporary
        this._amveCore = _amveCore;
        // expose public api
        this.videoEditor = {
            setMarkIn: (value: number) => {
                this._amveCore._amveUX.clipData.markInPT = value;
            },
            setMarkOut: (value: number) => {
                this._amveCore._amveUX.clipData.markOutPT = value;
            }
        }
    });
}

module AMVE {

    /**
     * Core logic for AMVE
     */
    export class AMVECore implements IEventSource {
        public player: amp.Player;
        public containerId: string;
        public customMetadataContainerId: string;
        private _amveUX: AMVEUX;
        private _eventHandlers = {};
        private _clipData: AMVEClipData;
        private _clipDataCallback: Function;
        private _shortcutConfig: KeyboardShortcutConfig;
        private _submitDialogConfig: SubmitDialogConfig;

        constructor(player: amp.Player, options: Object) {
            if (!options['containerId']) {
                throw new Error('AMVE options Error: you must specify a containerId!');
            }

            if (!options['clipdataCallback']) {
                throw new Error('AMVE options Error: you must specify a clipdataCallback!');
            }

            var that = this;
            this.player = player;
            this.player.controls(false);
            this.containerId = options['containerId'];
            this.customMetadataContainerId = options['customMetadataContainerId'];
            this._clipDataCallback = options['clipdataCallback'];
            this._shortcutConfig = options['keyboardShortcutConfig'];

            const defaultSubmitDialogConfig: SubmitDialogConfig = { generateThumbnails: true };
            this._submitDialogConfig = options['submitDialog'] || defaultSubmitDialogConfig;

            this._amveUX = new AMVEUX(this);
        }

        public addEventListener(event: string, handler: EventListener) {
            this._eventHandlers[event] = this._eventHandlers[event] || [];
            this._eventHandlers[event].push(handler);
        }

        public removeEventListener(event: string, handler: EventListener) {
            this._eventHandlers[event] = this._eventHandlers[event] || [];
            this._eventHandlers[event].pop(handler);
        }

        public trigger(event: string) {
            var handlers = this._eventHandlers[event];
            if (handlers) {
                for (var i = 0; i < handlers.length; i++) {
                    handlers[i](event);
                }
            }
        }

        public get clipData(): AMVEClipData {
            return this._clipData;
        }

        public set clipData(clipData: AMVEClipData) {
            this._clipData = clipData;
            this.trigger('clipdatacreated');
            if (this._clipDataCallback) {
                this._clipDataCallback(this._clipData);
            }
        }

        public get keyboardShortcutConfig(): KeyboardShortcutConfig {
            return this._shortcutConfig;
        }

        public get submitDialogConfig(): SubmitDialogConfig {
            return this._submitDialogConfig;
        }
    }
}