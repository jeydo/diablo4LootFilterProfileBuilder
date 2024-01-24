let itemTypes = [],
    affixes = {},
    aspects = {};
itemTypes = ['helm', 'chest armor', 'pants', 'gloves', 'boots', 'ring', 'amulet', 'axe', 'tow-handed axe', 'sword', 'two-handed sword', 'mace', 'two-handed mace', 'scythe', 'two-handed scythe', 'bow', 'bracers', 'crossbow', 'dagger', 'polarm', 'shield', 'staff', 'wand', 'offhand', 'totem'];
affixes = {
    "all_stats": "all stats",
    "dexterity": "dexterity",
    "energy_on_kill": "energy on kill",
    "essence_on_kill": "essence on kill",
    "fury_on_kill": "fury on kill"
};
aspects = {
    "of_berserk_ripping": {
        "desc": "whenever you deal direct damage while berserking, inflict of the base damage dealt as additional bleeding damage over seconds.",
        "snoId": 1105985
    },
    "earthquake": {
        "desc": "ground stomp creates an earthquake damaging enemies for physical damage over seconds. while standing in earthquakes, you deal increased damage.",
        "snoId": 1105986
    },
    "skullbreakers": {
        "desc": "stunning a bleeding enemy deals of their total bleeding amount to them as physical damage.",
        "snoId": 1105987
    },
    "weapon_masters": {
        "desc": "your weapon mastery skills have an additional charge. lucky hit damaging an enemy with a weapon mastery skill has up to a chance to stun them for seconds.",
        "snoId": 1105988
    },
    "iron_blood": {
        "desc": "gain damage reduction for each nearby bleeding enemy up to maximum.",
        "snoId": 1105989
    }
};
document.addEventListener('alpine:init', () => {
    Alpine.data('d4data', () => ({
        itemTypes : itemTypes,
        affixes : affixes,
        aspects : aspects,
        showAffixes : true,
        showAspects : true,
        showContentFile : false,
        myList : [],
        init() {
            this.fetchFiles();
            this.myList = this.getMyList();
            this.triggerSlimSelect();
        },
        fetchFiles() {
            fetch('./affixes.json').then((response) => response.json())
                .then((json) => this.affixes = json).catch((error) => console.error(error));
            fetch('./aspects.json').then((response) => response.json())
                .then((json) => this.aspects = json).catch((error) => console.error(error));
            fetch('./itemtypes.json').then((response) => response.json())
                .then((json) => this.itemTypes = json).catch((error) => console.error(error));
        },
        getMyList() {
            let myList = localStorage.getItem('myList');
            if (myList) {
                return JSON.parse(myList);
            }
            return this.defaultList();
        },
        defaultList() {
            return {
                affixes : [],
                aspects : []
            };
        },
        buildNewItem() {
            return {
                id: new Date().getTime(),
                name : '',
                itemType : [],
                minPower : 780,
                affixPools : [],
                minAffixCount : 3
            }
        },
        removeItem(key) {
            this.myList.affixes.splice(key, 1);
            this.saveList();
        },
        clearItems() {
            this.myList = this.defaultList();
            this.saveList();
        },
        saveList() {
            localStorage.setItem('myList', JSON.stringify(this.myList));
        },
        addNewItem() {
            let newItem = this.buildNewItem();
            this.myList.affixes.push(newItem);
            this.saveList();
            this.triggerSlimSelect();
        },
        triggerSlimSelect() {
            this.$nextTick(() => {
                document.querySelectorAll('select').forEach((select) => {
                    if (select.classList.contains('slimselect')) {
                        return;
                    }
                    this.setSlimSelect(select, select.attributes.placeholder.value);
                });
            });
        },
        setSlimSelect(key, placeholder) {
            new SlimSelect({ select: key, settings: { placeholderText: placeholder }});
            key.classList.add('slimselect');
        },
        addAffix(key) {
            this.myList.affixes[key].affixPools.push({
                affix: '',
                value: ''
            });
            this.triggerSlimSelect();
        },
        removeAffix(key, affixKey) {
            this.myList.affixes[key].affixPools.splice(affixKey, 1);
            this.saveList();
        },
        contentFile() {
            let content = '';
            if (this.myList.aspects.length) {
                content = "Aspects:\n";
                for (const item of this.myList.aspects) {
                    content += "  - [" + item.aspect + (item.value ? ', ' + item.value : '') + "]\n";
                }
                content += "\n";
            }
            if (this.myList.affixes.length) {
                content += "Affixes:\n";
                for (const item of this.myList.affixes) {
                    content += "  - " + item.name + "\n";
                    content += "      ItemType: [" + item.itemType.join(', ') + "]\n";
                    content += "      minPower: " + item.minPower + "\n";
                    content += "      affixPools:\n";
                    for (const affix of item.affixPools) {
                        content += "        - [" + affix.affix + (affix.value ? ', ' + affix.value : '') + "]\n";
                    }
                    content += "      minAffixCount: " + item.minAffixCount + "\n";
                    content += "\n";
                }
            }
            return content;
        },
        copyContentFile() {
            navigator.clipboard.writeText(this.contentFile());
        },
        addAspect(){
            this.myList.aspects.push({
                aspect: '',
                value: ''
            });
            this.triggerSlimSelect();
        },
        removeAspect(key) {
            this.myList.aspects.splice(key, 1);
            this.saveList();
        }
    }));
});