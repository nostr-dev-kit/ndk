import NDK, { NDKEvent, nest } from "..";

describe("NDKNestedEvent", () => {
  const ndk = new NDK();

  describe("nest", () => {
    it('nests events from marked tags', async () => {
      const events = rawEvents.map(e => new NDKEvent(ndk, e));
      const nestedEvents = nest(events);
      expect(nestedEvents[0].content).toEqual("a");
      expect(nestedEvents[0].children[0].content).toEqual("b");
      expect(nestedEvents[0].children[0].children[0].content).toEqual("c");
    });

    it('nests events from positional tags', async () => {
      const events = gigiEvents.map(e => new NDKEvent(ndk, e));
      const nestedEvents = nest(events);
      expect(nestedEvents[1].children[0].content).toMatch("Unfortunately");
      expect(nestedEvents[1].children[0].children[0].content).toEqual("we early ");
    });
  });
});

// Test events with NIP-10 marked tags
const rawEvents = [
  {
    "created_at": 0,
    "pubkey": "a1b2b3",
    "id": "abc123",
    "content": "a",
    "tags": [["p", "123456"]]
  },
  {
    "created_at": 1,
    "pubkey": "e4d3b2",
    "id": "456def",
    "content": "b",
    "tags": [
      ["p", "123456"],
      ["e", "abc123", "", "root"],
      ["e", "f1e2d3", "", "mention"]
    ]
  },
  {
    "created_at": 2,
    "id": "789cef",
    "pubkey": "f6a9c5",
    "content": "c",
    "tags": [
      ["e", "456def", "", "reply"],
      ["p", "123456"],
      ["e", "abc123", "", "root"]
    ]
  },
];

// Real events from naddr1qqxnzd3cxqmrzv3exgmr2wfeqgsxu35yyt0mwjjh8pcz4zprhxegz69t4wr9t74vk6zne58wzh0waycrqsqqqa28pjfdhz
const gigiEvents = [
  {
    "created_at": 1684674845,
    "content": "Getting my head around this",
    "tags": [
      [
        "p",
        "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52"
      ],
      [
        "e",
        "532808e4d60f5f82b95aeaa3ed2e930a0c5973dccb0ede68b28b1931db91440f"
      ],
      [
        "p",
        "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93"
      ],
      [
        "a",
        "30023:6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93:1680612926599"
      ]
    ],
    "kind": 1,
    "pubkey": "d85c99afd244911e0aaf800cbea4221df557f06f8a4ff2cbe84b24e0b9e728fc",
    "id": "741f5367a9415f4d6f19c0f57a1e4647c8ed8309b53b0da2d82fc4ebfba03b2c",
    "sig": "069874040bac26a219777fc0f90b8f4df71e38c30e3e6a953d53222499d8e0c5a8f32c6b4204d14eb335bb654f01c5610372d9dc00062284b8e0f2bb98c7ed85"
  },
  {
    "created_at": 1680636068,
    "content": "we early ",
    "tags": [
      [
        "e",
        "44d3ecbb5752e96becc330d9b56352ea595d37b4c55edd8701fd24f18df5eee2",
      ],
      [
        "e",
        "d4a0b4f08d98d82a04292654ec132723cc2cf3fa24ffb6c0833426cb9372f4d5",
      ],
      [
        "p",
        "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93"
      ],
      [
        "p",
        "39a8b17475be0db44e313f9fd032ffde183c8abd6498e4932a873330d2cd4868"
      ],
      [
        "a",
        "30023:6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93:1680612926599"
      ]
    ],
    "kind": 1,
    "pubkey": "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93",
    "id": "8cdc4676aca93bbafcfbe6784f9b2df54e8ca20fbe69ba55fda487736bfdb7f6",
    "sig": "b8026e43c61b491014915caf79289968b87e52aa87a487ebecbf6cb2b3c07d460f2ab1a86da99b1c5410a0f5d14e77cf27f78c56bf1ab709f0d616ad2711de78"
  },
  {
    "created_at": 1680618462,
    "content": "Unfortunately when boosting this it gets broken 🥹\n#[1]",
    "tags": [
      [
        "e",
        "44d3ecbb5752e96becc330d9b56352ea595d37b4c55edd8701fd24f18df5eee2"
      ],
      [
        "p",
        "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93"
      ],
      [
        "p",
        "39a8b17475be0db44e313f9fd032ffde183c8abd6498e4932a873330d2cd4868"
      ],
      [
        "a",
        "30023:6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93:1680612926599"
      ]
    ],
    "kind": 1,
    "pubkey": "39a8b17475be0db44e313f9fd032ffde183c8abd6498e4932a873330d2cd4868",
    "id": "d4a0b4f08d98d82a04292654ec132723cc2cf3fa24ffb6c0833426cb9372f4d5",
    "sig": "c4a4197df4fec008f2f565170d09c46f0b9a7217ed90432cb53d1dddf70ad8520722b6e4f04ec9e52dd219ee01387c6191f449cd10a6c2488b1d2866424b7a8a"
  },
  {
    "created_at": 1680618199,
    "content": "Another #[1] \"must read\" #Bitcoin #Nostr 🤯\n\n\"Imagine a visual overlay of all public highlights, automatically shining a light on what the swarm of readers found most useful, insightful, funny, etc.\n\nFurther, imagine the possibility of sharing these highlights ... with one click, automatically tagging the highlighter(s) as well as the author, of course, so that eventual sat-flows can be split and forwarded automatically.\"\n\n#[0]",
    "tags": [
      [
        "p",
        "6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93"
      ],
      [
        "a",
        "30023:6e468422dfb74a5738702a8823b9b28168abab8655faacb6853cd0ee15deee93:1680612926599"
      ],
      [
        "t",
        "Bitcoin"
      ],
      [
        "t",
        "Nostr"
      ]
    ],
    "kind": 1,
    "pubkey": "39a8b17475be0db44e313f9fd032ffde183c8abd6498e4932a873330d2cd4868",
    "id": "44d3ecbb5752e96becc330d9b56352ea595d37b4c55edd8701fd24f18df5eee2",
    "sig": "19d438f753f88bf5f1dd2d01977a196d5b954d740fdd98c4546a8a7179972d9bca2864366af6025a5bea3e0a41fc30bfc0a162e66760ea6727bba8c5ca4a0de2"
  },
];