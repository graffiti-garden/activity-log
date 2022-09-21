export default function({toggleLogIn, myID, useCollection}) { return {

  setup: ()=> ({
    myID, toggleLogIn,
    everything:
      useCollection({_audit: true})
  }),

  methods: {
    async removeEverything() {
      if (confirm("Are you SURE you want to remove all your graffiti data? This cannot be undone")) {
        await this.everything.removeMine()
        alert("Everything deleted!")
      }
    },

    downloadEverything() {
      const file = new Blob(
        [JSON.stringify(this.everything, null, 2)],
        {type: 'application/json'})

      const a = document.createElement("a")
      a.href = URL.createObjectURL(file)
      a.download = 'graffiti-data.json'
      a.click()
    },

    processFile(file) {
      if (!confirm("Uploading will not remove existing data but it will replace data with existing IDs, for example data that you have edited. Are you sure you want to continue?")) return

      const reader = new FileReader()

      reader.addEventListener("load",
        ()=> this.mergeFile(reader.result))

      reader.readAsText(file)
    },

    async mergeFile(fileString) {
      try {
        const objects = JSON.parse(fileString)
        if(!Array.isArray(objects)) {
          throw 'the uploaded data must be an array of graffiti objects'
        }

        for (const object of objects) {
          await this.everything.update(object)
        }

        alert("Everything uploaded!")
      } catch(e) {
        alert(JSON.stringify(e))
      }
    }
  },

  template: `
    <nav>
      <menu>
        <li>
          <a href="..">Graffiti Homepage</a>
        </li>
        <li v-if="myID">
          <a href="" @click.prevent="toggleLogIn">Log Out</a>
        </li>
      </menu>
    </nav>

    <h1>
      Activity Log
    </h1>

    <template v-if="!myID">
      <menu>
        <li>
          <button @click="toggleLogIn">
            🚪 Log In 🚪
          </button>
        </li>
      </menu>
    </template>
    <template v-else>
      <menu>
        <li>
          <button @click="downloadEverything">
            💾 Download All Data 💾
          </button>
        </li>

        <li>
          <label>
            <input type="file" @change="processFile($event.target.files[0])" />
            🔄 Upload Data 🔄
          </label>
        </li>

        <li>
          <button @click="removeEverything">
            ❌ Remove All Data ❌
          </button>
        </li>
      </menu>
    </template>`
}}
