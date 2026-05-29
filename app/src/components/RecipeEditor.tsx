"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    DndContext,
    PointerSensor,
    TouchSensor,
    KeyboardSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core"

import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove,
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"


type Provenance =
    | "verbatim"
    | "normalized"
    | "inferred"
    | "altered"

type Visibility =
    | "private"
    | "public"

type ParsedField = {
    value: string
    provenance: Provenance
}

type ParsedIngredient = {
    id: string
    amount: string
    unit: string
    ingredient: string
    provenance: Provenance
}

type ParsedInstruction = {
    id: string
    value: string
    provenance: Provenance
}

export type RecipeEditorResult = {
    slug: string

    visibility: Visibility

    title: ParsedField

    description: ParsedField

    ingredients: ParsedIngredient[]

    instructions: ParsedInstruction[]

    prepTime: ParsedField

    cookTime: ParsedField

    servings: ParsedField
}

type RecipeEditorProps = {
    mode: "create" | "edit"

    initialRecipe: RecipeEditorResult

    sourceText?: string

    saveEndpoint: string

    redirectSlug?: string
}

function provenanceClasses(
    provenance: Provenance
) {
    switch (provenance) {
        case "verbatim":
            return "border-emerald-700 bg-emerald-950/30 text-emerald-300"

        case "normalized":
            return "border-amber-700 bg-amber-950/30 text-amber-300"

        case "inferred":
            return "border-red-700 bg-red-950/30 text-red-300"

        case "altered":
            return "border-blue-700 bg-blue-950/30 text-blue-300"

        default:
            return "border-zinc-700 bg-zinc-900 text-zinc-300"
    }
}

function ProvenanceBadge({
    provenance,
}: {
    provenance: Provenance
}) {
    return (
        <div
            className={`text-xs px-2 py-1 rounded-full border uppercase tracking-wide ${provenanceClasses(
                provenance
            )}`}
        >
            {provenance}
        </div>
    )
}

function SortableWrapper({
    id,
    children,
}: {
    id: string
    children: React.ReactNode
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id,
    })

    const style = {
        transform:
            CSS.Transform.toString(
                transform
            ),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="relative"
        >
            <div
                {...attributes}
                {...listeners}
                className="absolute top-4 right-4 cursor-grab text-zinc-500 select-none"
            >
                ⋮⋮
            </div>

            {children}
        </div>
    )
}

export default function RecipeEditor({
    mode,
    initialRecipe,
    sourceText,
    saveEndpoint,
    redirectSlug,
}: RecipeEditorProps) {
    const router = useRouter()

    const [result, setResult] =
        useState(initialRecipe)

    const [saving, setSaving] =
        useState(false)

    const [imageMode, setImageMode] =
        useState<"ai" | "upload">(
            "ai"
        )

    const [imageFile, setImageFile] =
        useState<File | null>(null)

    const [generatedImage, setGeneratedImage] =
        useState<string | null>(null)

    const [generatingImage, setGeneratingImage] =
        useState(false)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor),
        useSensor(KeyboardSensor)
    )

    async function generateImage() {
        setGeneratingImage(true)

        try {
            const res = await fetch(
                "/api/generate-recipe-image",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        title:
                            result.title.value,

                        description:
                            result.description
                                .value,

                        ingredients:
                            result.ingredients.map(
                                (
                                    ingredient
                                ) => ({
                                    ingredient:
                                        ingredient.ingredient,
                                })
                            ),
                    }),
                }
            )

            const data = await res.json()

            if (data.image) {
                setGeneratedImage(
                    `data:image/png;base64,${data.image}`
                )
            }
        } finally {
            setGeneratingImage(false)
        }
    }

    async function saveRecipe() {
        setSaving(true)

        try {
            const normalizedRecipe = {
                slug: result.slug,

                visibility:
                    result.visibility,

                title:
                    result.title.value,

                description:
                    result.description.value,

                prepTime:
                    result.prepTime.value,

                cookTime:
                    result.cookTime.value,

                servings:
                    result.servings.value,

                sourceText,

                titleProvenance:
                    result.title.provenance,

                descriptionProvenance:
                    result.description.provenance,

                prepTimeProvenance:
                    result.prepTime.provenance,

                cookTimeProvenance:
                    result.cookTime.provenance,

                servingsProvenance:
                    result.servings.provenance,

                generatedImage,

                ingredients:
                    result.ingredients.map(
                        (ingredient) => ({
                            id:
                                ingredient.id,

                            amount:
                                ingredient.amount,

                            unit:
                                ingredient.unit,

                            ingredient:
                                ingredient.ingredient,

                            provenance:
                                ingredient.provenance,
                        })
                    ),

                instructions:
                    result.instructions.map(
                        (instruction) => ({
                            id:
                                instruction.id,

                            value:
                                instruction.value,

                            provenance:
                                instruction.provenance,
                        })
                    ),
            }

            const res = await fetch(
                saveEndpoint,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify(
                        normalizedRecipe
                    ),
                }
            )

            const data = await res.json()

            if (!res.ok) {
                alert(
                    data.error ??
                    "Failed to save recipe"
                )

                return
            }

            router.push(
                `/recipes/${data.slug ??
                redirectSlug ??
                result.slug
                }`
            )
        } finally {
            setSaving(false)
        }
    }

    function updateField(
        field:
            | "title"
            | "description"
            | "prepTime"
            | "cookTime"
            | "servings",
        value: string
    ) {
        setResult({
            ...result,

            [field]: {
                value,

                provenance:
                    "altered",
            },
        })
    }

    function updateIngredient(
        idx: number,
        field:
            | "amount"
            | "unit"
            | "ingredient",
        value: string
    ) {
        const updated = [
            ...result.ingredients,
        ]

        updated[idx] = {
            ...updated[idx],

            [field]: value,

            provenance:
                "altered",
        }

        setResult({
            ...result,

            ingredients: updated,
        })
    }

    function updateInstruction(
        idx: number,
        value: string
    ) {
        const updated = [
            ...result.instructions,
        ]

        updated[idx] = {
            ...updated[idx],

            value,

            provenance:
                "altered",
        }

        setResult({
            ...result,

            instructions: updated,
        })
    }

    function handleIngredientDragEnd(
        event: any
    ) {
        const {
            active,
            over,
        } = event

        if (
            !over ||
            active.id === over.id
        ) {
            return
        }

        const oldIndex =
            result.ingredients.findIndex(
                (i) =>
                    i.id === active.id
            )

        const newIndex =
            result.ingredients.findIndex(
                (i) =>
                    i.id === over.id
            )

        setResult({
            ...result,
            ingredients: arrayMove(
                result.ingredients,
                oldIndex,
                newIndex
            ),
        })
    }

    function handleInstructionDragEnd(
        event: any
    ) {
        const {
            active,
            over,
        } = event

        if (
            !over ||
            active.id === over.id
        ) {
            return
        }

        const oldIndex =
            result.instructions.findIndex(
                (i) =>
                    i.id === active.id
            )

        const newIndex =
            result.instructions.findIndex(
                (i) =>
                    i.id === over.id
            )

        setResult({
            ...result,
            instructions: arrayMove(
                result.instructions,
                oldIndex,
                newIndex
            ),
        })
    }

    return (
        <div className="space-y-8">
            <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-semibold">
                            Recipe Details
                        </h2>

                        <p className="text-zinc-400 mt-2">
                            Edit recipe metadata
                            and visibility.
                        </p>
                    </div>

                    <select
                        value={
                            result.visibility
                        }
                        onChange={(e) =>
                            setResult({
                                ...result,

                                visibility:
                                    e.target
                                        .value as Visibility,
                            })
                        }
                        className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3"
                    >
                        <option value="private">
                            Private
                        </option>

                        <option value="public">
                            Public
                        </option>
                    </select>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-zinc-400">
                            Title
                        </label>

                        <ProvenanceBadge
                            provenance={
                                result.title
                                    .provenance
                            }
                        />
                    </div>

                    <input
                        value={
                            result.title.value
                        }
                        onChange={(e) =>
                            updateField(
                                "title",
                                e.target.value
                            )
                        }
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm text-zinc-400">
                            Description
                        </label>

                        <ProvenanceBadge
                            provenance={
                                result.description
                                    .provenance
                            }
                        />
                    </div>

                    <textarea
                        value={
                            result.description
                                .value
                        }
                        onChange={(e) =>
                            updateField(
                                "description",
                                e.target.value
                            )
                        }
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 h-24"
                    />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-zinc-400">
                                Prep Time
                            </label>

                            <ProvenanceBadge
                                provenance={
                                    result.prepTime
                                        .provenance
                                }
                            />
                        </div>

                        <input
                            value={
                                result.prepTime
                                    .value
                            }
                            onChange={(e) =>
                                updateField(
                                    "prepTime",
                                    e.target.value
                                )
                            }
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-zinc-400">
                                Cook Time
                            </label>

                            <ProvenanceBadge
                                provenance={
                                    result.cookTime
                                        .provenance
                                }
                            />
                        </div>

                        <input
                            value={
                                result.cookTime
                                    .value
                            }
                            onChange={(e) =>
                                updateField(
                                    "cookTime",
                                    e.target.value
                                )
                            }
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm text-zinc-400">
                                Servings
                            </label>

                            <ProvenanceBadge
                                provenance={
                                    result.servings
                                        .provenance
                                }
                            />
                        </div>

                        <input
                            value={
                                result.servings
                                    .value
                            }
                            onChange={(e) =>
                                updateField(
                                    "servings",
                                    e.target.value
                                )
                            }
                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                        />
                    </div>
                </div>
            </div>

            <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-6">
                <div>
                    <h2 className="text-3xl font-semibold">
                        Recipe Image
                    </h2>

                    <p className="text-zinc-400 mt-2">
                        Upload an image or
                        generate one with AI.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() =>
                            setImageMode("ai")
                        }
                        className={`px-4 py-2 rounded-xl border transition-colors ${imageMode === "ai"
                            ? "border-white bg-white text-black"
                            : "border-zinc-700 bg-zinc-950"
                            }`}
                    >
                        AI Image
                    </button>

                    <button
                        onClick={() =>
                            setImageMode(
                                "upload"
                            )
                        }
                        className={`px-4 py-2 rounded-xl border transition-colors ${imageMode ===
                            "upload"
                            ? "border-white bg-white text-black"
                            : "border-zinc-700 bg-zinc-950"
                            }`}
                    >
                        Upload
                    </button>
                </div>

                {imageMode ===
                    "upload" && (
                        <div className="space-y-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setImageFile(
                                        e.target
                                            .files?.[0] ??
                                        null
                                    )
                                }
                            />

                            {imageFile && (
                                <img
                                    src={URL.createObjectURL(
                                        imageFile
                                    )}
                                    alt="Preview"
                                    className="rounded-2xl border border-zinc-800 max-w-xl"
                                />
                            )}
                        </div>
                    )}

                {imageMode === "ai" && (
                    <div className="space-y-4">
                        <button
                            onClick={
                                generateImage
                            }
                            disabled={
                                generatingImage
                            }
                            className="border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 px-5 py-3 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {generatingImage
                                ? "Generating..."
                                : "Generate AI Image"}
                        </button>

                        {generatedImage && (
                            <img
                                src={generatedImage}
                                alt="Generated recipe"
                                className="rounded-2xl border border-zinc-800 max-w-xl"
                            />
                        )}
                    </div>
                )}
            </div>

            <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-semibold">
                        Ingredients
                    </h2>

                    <button
                        onClick={() =>
                            setResult({
                                ...result,

                                ingredients: [
                                    ...result.ingredients,
                                    {
                                        id: crypto.randomUUID(),
                                        amount: "",
                                        unit: "",
                                        ingredient: "",
                                        provenance: "altered",
                                    },
                                ],
                            })
                        }
                        className="border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 px-4 py-2 rounded-xl"
                    >
                        Add Ingredient
                    </button>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleIngredientDragEnd}
                >
                    <SortableContext
                        items={result.ingredients.map(
                            (i) => i.id!
                        )}
                        strategy={
                            verticalListSortingStrategy
                        }
                    >
                        {result.ingredients.map(
                            (
                                ingredient,
                                idx
                            ) => (
                                <SortableWrapper
                                    key={ingredient.id}
                                    id={ingredient.id!}
                                >
                                    <div className="space-y-2 border border-zinc-800 rounded-2xl p-4">
                                        <div className="flex items-center justify-between">
                                            <ProvenanceBadge
                                                provenance={
                                                    ingredient.provenance
                                                }
                                            />

                                            <button
                                                onClick={() => {
                                                    setResult({
                                                        ...result,

                                                        ingredients:
                                                            result.ingredients.filter(
                                                                (
                                                                    _,
                                                                    i
                                                                ) =>
                                                                    i !==
                                                                    idx
                                                            ),
                                                    })
                                                }}
                                                className="border border-red-800 bg-red-950 hover:bg-red-900 px-3 py-2 rounded-xl text-red-300"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-3">
                                            <input
                                                value={
                                                    ingredient.amount
                                                }
                                                onChange={(e) =>
                                                    updateIngredient(
                                                        idx,
                                                        "amount",
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                placeholder="Amount"
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                                            />

                                            <input
                                                value={
                                                    ingredient.unit
                                                }
                                                onChange={(e) =>
                                                    updateIngredient(
                                                        idx,
                                                        "unit",
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                placeholder="Unit"
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                                            />

                                            <input
                                                value={
                                                    ingredient.ingredient
                                                }
                                                onChange={(e) =>
                                                    updateIngredient(
                                                        idx,
                                                        "ingredient",
                                                        e.target
                                                            .value
                                                    )
                                                }
                                                placeholder="Ingredient"
                                                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3"
                                            />
                                        </div>
                                    </div>
                                </SortableWrapper>
                            )
                        )}
                    </SortableContext>
                </DndContext>
            </div>

            <div className="border border-zinc-800 bg-zinc-900 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-semibold">
                        Instructions
                    </h2>

                    <button
                        onClick={() =>
                            setResult({
                                ...result,

                                instructions: [
                                    ...result.instructions,
                                    {
                                        id: crypto.randomUUID(),
                                        value: "",
                                        provenance: "altered",
                                    },
                                ],
                            })
                        }
                        className="border border-zinc-700 bg-zinc-950 hover:bg-zinc-800 px-4 py-2 rounded-xl"
                    >
                        Add Step
                    </button>
                </div>

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={
                        handleInstructionDragEnd
                    }
                >
                    <SortableContext
                        items={result.instructions.map(
                            (i) => i.id!
                        )}
                        strategy={
                            verticalListSortingStrategy
                        }
                    >
                        {result.instructions.map(
                            (
                                step,
                                idx
                            ) => (
                                <SortableWrapper
                                    key={step.id}
                                    id={step.id!}
                                >
                                    <div className="space-y-2 border border-zinc-800 rounded-2xl p-4">
                                        <div className="flex items-center justify-between">
                                            <ProvenanceBadge
                                                provenance={
                                                    step.provenance
                                                }
                                            />

                                            <button
                                                onClick={() => {
                                                    setResult({
                                                        ...result,

                                                        instructions:
                                                            result.instructions.filter(
                                                                (
                                                                    _,
                                                                    i
                                                                ) =>
                                                                    i !==
                                                                    idx
                                                            ),
                                                    })
                                                }}
                                                className="border border-red-800 bg-red-950 hover:bg-red-900 px-3 py-2 rounded-xl text-red-300"
                                            >
                                                Remove
                                            </button>
                                        </div>

                                        <textarea
                                            value={step.value}
                                            onChange={(e) =>
                                                updateInstruction(
                                                    idx,
                                                    e.target.value
                                                )
                                            }
                                            className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-3 h-28"
                                        />
                                    </div>
                                </SortableWrapper>
                            )
                        )}
                    </SortableContext>
                </DndContext>
            </div>

            <button
                onClick={saveRecipe}
                disabled={saving}
                className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
            >
                {saving
                    ? mode === "edit"
                        ? "Updating..."
                        : "Saving..."
                    : mode === "edit"
                        ? "Update Recipe"
                        : "Save Recipe"}
            </button>
        </div>
    )
}